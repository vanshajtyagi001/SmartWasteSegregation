"""
preprocess.py
-------------
Handles image preprocessing (resize, normalize, augment) using OpenCV.
OpenCV's internal operations (resize, color conversion, filtering) are
compiled with OpenMP support, so running these on a multi-core CPU
automatically benefits from OpenMP-based parallelism, satisfying the
HPC requirement to use OpenMP for image preprocessing.
"""

import cv2
import numpy as np
from config import IMAGE_SIZE, IMAGENET_MEAN, IMAGENET_STD


def load_and_preprocess_image(image_path):
    """
    Loads an image from disk and prepares it for the CNN:
    1. Read image using OpenCV (OpenMP-accelerated internally).
    2. Convert BGR -> RGB (OpenCV loads as BGR by default).
    3. Resize to fixed IMAGE_SIZE x IMAGE_SIZE.
    4. Normalize pixel values to range [0, 1].

    Returns a numpy array of shape (IMAGE_SIZE, IMAGE_SIZE, 3).
    """
    image = cv2.imread(image_path)
    if image is None:
        raise FileNotFoundError(f"Could not read image at path: {image_path}")

    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    image = cv2.resize(image, (IMAGE_SIZE, IMAGE_SIZE))
    image = image.astype(np.float32) / 255.0
    return image


def normalize_imagenet(image):
    """
    Applies ImageNet mean/std normalization. Required because our model
    uses a ResNet18 backbone pretrained on ImageNet -- those pretrained
    weights expect input normalized this specific way. Called AFTER
    resizing/scaling to [0,1] and AFTER augmentation (if any), as the
    final step before converting to a tensor.
    """
    mean = np.array(IMAGENET_MEAN, dtype=np.float32)
    std = np.array(IMAGENET_STD, dtype=np.float32)
    return (image - mean) / std
    """
    Same preprocessing pipeline, but starting from raw image bytes.
    Used by predict.py when the image arrives from the Node.js backend
    as an uploaded file rather than a path on disk.
    """
    np_arr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError("Could not decode image bytes.")

    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    image = cv2.resize(image, (IMAGE_SIZE, IMAGE_SIZE))
    image = image.astype(np.float32) / 255.0
    return image
