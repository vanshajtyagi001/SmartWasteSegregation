#!/bin/bash
# run_predict.sh
# --------------
# Runs a single prediction on an image. Mainly used for manual testing
# and also invoked internally by the Node.js backend.
#
# Usage: ./run_predict.sh path/to/image.jpg

if [ -z "$1" ]; then
    echo "Usage: ./run_predict.sh <image_path>"
    exit 1
fi

python3 predict.py "$1"
