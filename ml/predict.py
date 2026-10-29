"""
predict.py
----------
Loads the trained CNN (best_model.pth) and predicts the waste category
for a given image. This script is called by the Node.js backend
(via a child process) whenever a user captures/uploads an image.

Usage (command line, for testing):
    python predict.py path/to/image.jpg

Usage (from Node.js backend):
    The backend passes the image file path as a command-line argument
    and reads the JSON printed to stdout as the response.
"""

import sys
import json
import torch
import torch.nn.functional as F

from config import MODEL_SAVE_PATH, CLASSES, DUSTBIN_COLOR, get_device
from preprocess import load_and_preprocess_image, normalize_imagenet
from model import WasteCNN


def load_model(device):
    model = WasteCNN().to(device)
    model.load_state_dict(torch.load(MODEL_SAVE_PATH, map_location=device))
    model.eval()
    return model


def predict_image(image_path):
    device = get_device()
    model = load_model(device)

    # Preprocess the input image the same way it was preprocessed for training
    image = load_and_preprocess_image(image_path)
    image = normalize_imagenet(image)
    image_tensor = torch.from_numpy(image).permute(2, 0, 1).unsqueeze(0).to(device)

    with torch.no_grad():
        outputs = model(image_tensor)
        probabilities = F.softmax(outputs, dim=1)
        confidence, predicted_index = torch.max(probabilities, dim=1)

    predicted_class = CLASSES[predicted_index.item()]
    confidence_percent = round(confidence.item() * 100, 2)
    bin_color = DUSTBIN_COLOR[predicted_class]

    result = {
        "category": predicted_class,
        "confidence": confidence_percent,
        "dustbin_color": bin_color,
    }
    return result


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Usage: python predict.py <image_path>"}))
        sys.exit(1)

    image_path = sys.argv[1]

    try:
        result = predict_image(image_path)
        # IMPORTANT: only JSON is printed to stdout so Node.js can parse it directly
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
