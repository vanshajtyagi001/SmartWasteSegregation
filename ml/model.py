"""
model.py
--------
Uses a pretrained ResNet18 (trained on 1.2 million ImageNet images) as
the backbone for waste classification, fine-tuned for our 4 classes.
This is "transfer learning": instead of learning visual features
(edges, textures, shapes) entirely from scratch on our small ~2000-image
dataset, we start from a network that already knows general-purpose
vision features, and only re-train the parts needed to recognize our
specific waste categories.

Why this matters for this project: a CNN trained fully from scratch
(the earlier version of this file) needs a lot of data to learn good
features on its own -- with only ~500 images per class, it struggled to
generalize (see docs/VIVA_QUESTIONS.md Q14). A pretrained backbone
already understands general vision, so it adapts to a new task with far
fewer examples.

ResNet18 is still a CNN (Convolutional Neural Network) -- this keeps the
project consistent with the original brief ("Use CNN") while following
the "Future Enhancements" direction the synopsis itself suggested.
"""

import torch.nn as nn
from torchvision.models import resnet18, ResNet18_Weights
from config import NUM_CLASSES


class WasteCNN(nn.Module):
    def __init__(self, num_classes=NUM_CLASSES):
        super(WasteCNN, self).__init__()

        # Load ResNet18 with weights pretrained on ImageNet.
        weights = ResNet18_Weights.IMAGENET1K_V1
        self.backbone = resnet18(weights=weights)

        # Freeze all layers first -- they already know general visual
        # features (edges, textures, shapes) from ImageNet training and
        # don't need to change for our task.
        for param in self.backbone.parameters():
            param.requires_grad = False

        # Unfreeze only the last residual block (layer4). This is the
        # standard "partial fine-tuning" approach for small datasets:
        # early layers stay generic, while the deeper, more task-specific
        # layers adapt to waste images specifically. Fine-tuning the
        # entire network on only ~2000 images would risk overfitting.
        for param in self.backbone.layer4.parameters():
            param.requires_grad = True

        # Replace the final classification layer. The original layer
        # outputs 1000 ImageNet classes; we replace it with one that
        # outputs our 4 waste categories. This new layer is always
        # trainable (it starts from random weights).
        in_features = self.backbone.fc.in_features
        self.backbone.fc = nn.Linear(in_features, num_classes)

    def forward(self, x):
        return self.backbone(x)
