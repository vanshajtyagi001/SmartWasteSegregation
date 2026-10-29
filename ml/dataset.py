"""
dataset.py
----------
Defines a custom PyTorch Dataset class that loads the 4-class TrashNet
subset (plastic, paper, glass, metal) from disk and applies preprocessing.

Supports optional data augmentation (used only for the training set,
never validation) to reduce overfitting -- see augment.py.
"""

import os
import torch
from torch.utils.data import Dataset
from preprocess import load_and_preprocess_image, normalize_imagenet
from augment import apply_augmentation
from config import CLASSES


class TrashDataset(Dataset):
    """
    Expects folder structure:
        root_dir/
            plastic/*.jpg
            paper/*.jpg
            glass/*.jpg
            metal/*.jpg

    Args:
        root_dir: path to train/ or val/ folder.
        augment: if True, applies random flip/rotation/brightness jitter
                 to each image. Should be True for the training set only.
    """

    def __init__(self, root_dir, augment=False):
        self.samples = []  # list of (image_path, class_index)
        self.augment = augment

        for class_index, class_name in enumerate(CLASSES):
            class_folder = os.path.join(root_dir, class_name)
            if not os.path.isdir(class_folder):
                # Skip missing folders gracefully instead of crashing,
                # useful while dataset is still being downloaded/organized.
                print(f"[WARN] Folder not found, skipping: {class_folder}")
                continue

            for filename in os.listdir(class_folder):
                if filename.lower().endswith((".jpg", ".jpeg", ".png")):
                    self.samples.append(
                        (os.path.join(class_folder, filename), class_index)
                    )

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        image_path, label = self.samples[idx]
        image = load_and_preprocess_image(image_path)

        if self.augment:
            image = apply_augmentation(image)

        # ImageNet normalization must happen AFTER augmentation, as the
        # final step before converting to a tensor -- required by the
        # pretrained ResNet18 backbone (see model.py).
        image = normalize_imagenet(image)

        # Convert HWC (Height, Width, Channels) -> CHW as PyTorch expects
        image = torch.from_numpy(image.copy()).permute(2, 0, 1)
        label = torch.tensor(label, dtype=torch.long)
        return image, label

    def class_counts(self):
        """
        Returns a list of sample counts per class, in CLASSES order.
        Used by train.py to compute class weights that correct for
        imbalance (e.g. more 'paper' images than 'plastic').
        """
        counts = [0] * len(CLASSES)
        for _, label in self.samples:
            counts[label] += 1
        return counts
