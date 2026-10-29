"""
augment.py
----------
Simple data augmentation functions applied only to TRAINING images
(never to validation/test images). Augmentation artificially increases
the diversity of the training set by applying small random changes to
each image every epoch, which helps the CNN learn features that
generalize instead of memorizing exact pixel patterns.

This directly targets the overfitting seen in train.py's results
(training accuracy far exceeding validation accuracy): by the time the
model sees the same photo again in a later epoch, it looks slightly
different, so it can't simply memorize it.

Operates on the same (H, W, 3) float32 image format produced by
preprocess.py, in the range [0, 1].
"""

import cv2
import numpy as np
import random


def random_horizontal_flip(image, probability=0.5):
    """Mirrors the image left-right with the given probability."""
    if random.random() < probability:
        image = np.fliplr(image).copy()
    return image


def random_rotation(image, max_angle=15):
    """Rotates the image by a small random angle (in degrees)."""
    angle = random.uniform(-max_angle, max_angle)
    h, w = image.shape[:2]
    center = (w // 2, h // 2)
    rotation_matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
    rotated = cv2.warpAffine(
        image, rotation_matrix, (w, h), borderMode=cv2.BORDER_REFLECT
    )
    return rotated


def random_brightness(image, max_delta=0.15):
    """Randomly brightens or darkens the image, then clips to [0, 1]."""
    delta = random.uniform(-max_delta, max_delta)
    image = image + delta
    image = np.clip(image, 0.0, 1.0)
    return image


def apply_augmentation(image):
    """
    Applies the full augmentation pipeline used during training:
    flip -> rotate -> brightness jitter.
    Called once per image, per epoch, from TrashDataset.__getitem__
    when augment=True.
    """
    image = random_horizontal_flip(image)
    image = random_rotation(image)
    image = random_brightness(image)
    return image
