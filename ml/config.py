"""
config.py
---------
Central configuration file for the Smart Waste Segregation CNN project.
Keeping all constants in one place makes the project easy to explain
during viva and easy to modify without touching multiple files.
"""

import os
import sys
import torch

# ----------------------------
# Dataset settings
# ----------------------------
# Only 4 classes are used from TrashNet, as required by project scope.
CLASSES = ["plastic", "paper", "glass", "metal"]
NUM_CLASSES = len(CLASSES)

# Maps each class to the dustbin color the object should be thrown in
DUSTBIN_COLOR = {
    "plastic": "Yellow",
    "paper": "Blue",
    "glass": "Green",
    "metal": "Grey",
}

# Path to dataset folder. Expected structure:
# ml/dataset/train/<class_name>/*.jpg
# ml/dataset/val/<class_name>/*.jpg
DATASET_DIR = os.path.join(os.path.dirname(__file__), "dataset")
TRAIN_DIR = os.path.join(DATASET_DIR, "train")
VAL_DIR = os.path.join(DATASET_DIR, "val")

# ----------------------------
# Image settings
# ----------------------------
IMAGE_SIZE = 224  # ResNet18 (pretrained on ImageNet) expects 224x224 input

# ImageNet mean/std used to normalize images before feeding them to the
# pretrained ResNet18 backbone. The pretrained weights were trained with
# images normalized this specific way, so inference must match exactly.
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]

# ----------------------------
# Training hyperparameters
# ----------------------------
BATCH_SIZE = 32
NUM_EPOCHS = 25  # increased from 15 -- augmentation needs more epochs to converge
LEARNING_RATE = 0.001
WEIGHT_DECAY = 1e-4  # L2 regularization: penalizes large weights, reduces overfitting

# ----------------------------
# Paths
# ----------------------------
CHECKPOINT_DIR = os.path.join(os.path.dirname(__file__), "checkpoints")
MODEL_SAVE_PATH = os.path.join(CHECKPOINT_DIR, "best_model.pth")
RESULTS_DIR = os.path.join(os.path.dirname(__file__), "results")

# ----------------------------
# Device selection (CUDA -> CPU fallback)
# ----------------------------
def get_device():
    """
    Automatically selects CUDA GPU if available (required on HPC),
    otherwise falls back to CPU so the code also runs on a laptop.
    """
    if torch.cuda.is_available():
        device = torch.device("cuda")
        print(f"[INFO] CUDA GPU detected: {torch.cuda.get_device_name(0)}", file=sys.stderr)
    else:
        device = torch.device("cpu")
        print("[INFO] No CUDA GPU found. Falling back to CPU.", file=sys.stderr)
    return device

# ----------------------------
# OpenMP thread configuration (used for CPU-side parallel preprocessing)
# ----------------------------
def configure_openmp_threads(num_threads=None):
    """
    PyTorch and OpenCV are both built on top of OpenMP for CPU parallelism.
    This function sets the number of OpenMP threads used for operations
    like image resizing/normalization done on the CPU, satisfying the
    HPC requirement of using OpenMP for preprocessing.
    """
    if num_threads is None:
        num_threads = os.cpu_count()
    os.environ["OMP_NUM_THREADS"] = str(num_threads)
    torch.set_num_threads(num_threads)
    print(f"[INFO] OpenMP configured to use {num_threads} CPU threads for preprocessing.", file=sys.stderr)
