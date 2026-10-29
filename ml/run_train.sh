#!/bin/bash
# run_train.sh
# ------------
# Simple shell script to run training locally or manually on an HPC login
# node (for quick testing). For actual HPC cluster submission, use the
# PBS script (job_train.pbs) instead via `qsub job_train.pbs`.

echo "Starting Smart Waste Segregation model training..."

# Activate conda environment if it exists (optional, adjust name as needed)
# source activate waste-seg-env

python3 train.py

echo "Training script finished."
