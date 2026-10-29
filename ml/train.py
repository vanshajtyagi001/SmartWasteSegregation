"""
train.py
--------
Trains the WasteCNN model on the 4-class TrashNet subset.

Usage (local or HPC login node for quick test):
    python train.py

Usage on HPC (recommended, via PBS):
    qsub job_train.pbs

This script:
1. Configures OpenMP threads for CPU-side preprocessing.
2. Automatically detects CUDA GPU (falls back to CPU if unavailable).
3. Trains the CNN and tracks accuracy/loss per epoch.
4. Saves the best-performing model as checkpoints/best_model.pth.
5. Saves accuracy graph, loss graph, and confusion matrix to results/.
"""

import os
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
import matplotlib.pyplot as plt
from sklearn.metrics import confusion_matrix, recall_score
import numpy as np

from config import (
    TRAIN_DIR, VAL_DIR, BATCH_SIZE, NUM_EPOCHS, LEARNING_RATE, WEIGHT_DECAY,
    MODEL_SAVE_PATH, CHECKPOINT_DIR, RESULTS_DIR, CLASSES,
    get_device, configure_openmp_threads,
)
from dataset import TrashDataset
from model import WasteCNN


def train():
    # Step 0: Setup
    os.makedirs(CHECKPOINT_DIR, exist_ok=True)
    os.makedirs(RESULTS_DIR, exist_ok=True)
    configure_openmp_threads()
    device = get_device()

    # Step 1: Load datasets
    # Augmentation (flip/rotate/brightness jitter) is applied ONLY to the
    # training set -- validation must stay unmodified to give an honest
    # measure of real-world performance.
    train_dataset = TrashDataset(TRAIN_DIR, augment=True)
    val_dataset = TrashDataset(VAL_DIR, augment=False)

    if len(train_dataset) == 0:
        raise RuntimeError(
            "Training dataset is empty. Please download TrashNet and place "
            "images inside ml/dataset/train/<class_name>/ as described in "
            "docs/DATASET_GUIDE.md"
        )

    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True, num_workers=2)
    val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False, num_workers=2)

    # Step 2: Build model, loss function, optimizer
    model = WasteCNN().to(device)

    # Class-weighted loss: corrects for imbalance between classes (e.g.
    # more 'paper' images than 'plastic' in the confusion matrix earlier
    # caused the model to lean toward predicting the majority class).
    # Classes with fewer samples get a higher weight so mistakes on them
    # are penalized more heavily during training.
    class_counts = train_dataset.class_counts()
    total_samples = sum(class_counts)
    class_weights = [
        total_samples / (len(CLASSES) * count) if count > 0 else 0.0
        for count in class_counts
    ]
    class_weights_tensor = torch.tensor(class_weights, dtype=torch.float32).to(device)
    print(f"[INFO] Class counts: {dict(zip(CLASSES, class_counts))}")
    print(f"[INFO] Class weights: {dict(zip(CLASSES, [round(w, 3) for w in class_weights]))}")

    criterion = nn.CrossEntropyLoss(weight=class_weights_tensor)
    # weight_decay adds L2 regularization, penalizing large weights to
    # reduce overfitting (visible earlier as validation loss rising while
    # training loss kept falling).
    # Only pass trainable parameters to the optimizer -- most of the
    # ResNet18 backbone is frozen (see model.py), so only layer4 and
    # the new classifier head actually need gradient updates.
    trainable_params = filter(lambda p: p.requires_grad, model.parameters())
    optimizer = optim.Adam(trainable_params, lr=LEARNING_RATE, weight_decay=WEIGHT_DECAY)

    # Track metrics across epochs for graphs
    train_losses, val_losses = [], []
    train_accuracies, val_accuracies = [], []
    best_val_accuracy = 0.0
    best_macro_recall = 0.0  # what actually decides which checkpoint gets saved

    # Step 3: Training loop
    for epoch in range(NUM_EPOCHS):
        # ---- Training phase ----
        model.train()
        running_loss, correct, total = 0.0, 0, 0

        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)

            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * images.size(0)
            _, predicted = torch.max(outputs, 1)
            correct += (predicted == labels).sum().item()
            total += labels.size(0)

        epoch_train_loss = running_loss / max(total, 1)
        epoch_train_acc = correct / max(total, 1)
        train_losses.append(epoch_train_loss)
        train_accuracies.append(epoch_train_acc)

        # ---- Validation phase ----
        model.eval()
        val_loss, val_correct, val_total = 0.0, 0, 0
        all_preds, all_labels = [], []

        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                loss = criterion(outputs, labels)

                val_loss += loss.item() * images.size(0)
                _, predicted = torch.max(outputs, 1)
                val_correct += (predicted == labels).sum().item()
                val_total += labels.size(0)

                all_preds.extend(predicted.cpu().numpy())
                all_labels.extend(labels.cpu().numpy())

        epoch_val_loss = val_loss / max(val_total, 1)
        epoch_val_acc = val_correct / max(val_total, 1)
        val_losses.append(epoch_val_loss)
        val_accuracies.append(epoch_val_acc)

        # Macro-averaged recall: the average of each class's individual
        # recall, treating all 4 classes equally regardless of how many
        # samples each has. This matters because 'paper' has more
        # training images than the other classes -- if we picked the
        # "best" checkpoint using plain overall accuracy, we would tend
        # to save whichever epoch is best at predicting the majority
        # class (paper) even if plastic/glass/metal are performing
        # poorly. Macro recall forces every class to matter equally.
        epoch_macro_recall = recall_score(
            all_labels, all_preds, average="macro", zero_division=0
        )

        print(
            f"Epoch [{epoch+1}/{NUM_EPOCHS}] "
            f"Train Loss: {epoch_train_loss:.4f} Train Acc: {epoch_train_acc:.4f} | "
            f"Val Loss: {epoch_val_loss:.4f} Val Acc: {epoch_val_acc:.4f} | "
            f"Val Macro Recall: {epoch_macro_recall:.4f}"
        )

        # Save best model based on macro-averaged recall (balanced across
        # all classes), NOT overall accuracy, so no single class can
        # dominate which checkpoint gets kept.
        if epoch_macro_recall > best_macro_recall:
            best_macro_recall = epoch_macro_recall
            best_val_accuracy = epoch_val_acc
            torch.save(model.state_dict(), MODEL_SAVE_PATH)
            print(
                f"[INFO] New best model saved -- macro recall: {best_macro_recall:.4f} "
                f"(overall val accuracy: {epoch_val_acc:.4f})"
            )

    # Step 4: Save Accuracy Graph
    plt.figure()
    plt.plot(train_accuracies, label="Train Accuracy")
    plt.plot(val_accuracies, label="Validation Accuracy")
    plt.xlabel("Epoch")
    plt.ylabel("Accuracy")
    plt.title("Accuracy over Epochs")
    plt.legend()
    plt.savefig(os.path.join(RESULTS_DIR, "accuracy_graph.png"))
    plt.close()

    # Step 5: Save Loss Graph
    plt.figure()
    plt.plot(train_losses, label="Train Loss")
    plt.plot(val_losses, label="Validation Loss")
    plt.xlabel("Epoch")
    plt.ylabel("Loss")
    plt.title("Loss over Epochs")
    plt.legend()
    plt.savefig(os.path.join(RESULTS_DIR, "loss_graph.png"))
    plt.close()

    # Step 6: Save Confusion Matrix (from final epoch's validation predictions)
    if len(all_labels) > 0:
        cm = confusion_matrix(all_labels, all_preds)
        plt.figure()
        plt.imshow(cm, cmap="Blues")
        plt.title("Confusion Matrix")
        plt.colorbar()
        tick_marks = np.arange(len(CLASSES))
        plt.xticks(tick_marks, CLASSES, rotation=45)
        plt.yticks(tick_marks, CLASSES)
        for i in range(cm.shape[0]):
            for j in range(cm.shape[1]):
                plt.text(j, i, str(cm[i, j]), ha="center", va="center")
        plt.ylabel("True Label")
        plt.xlabel("Predicted Label")
        plt.tight_layout()
        plt.savefig(os.path.join(RESULTS_DIR, "confusion_matrix.png"))
        plt.close()

    print(f"[INFO] Training complete. Best model saved at: {MODEL_SAVE_PATH}")


if __name__ == "__main__":
    train()
