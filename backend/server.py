from fastapi import FastAPI, UploadFile, File
from fastapi.responses import FileResponse
import cv2
import numpy as np
import shutil
import os

app = FastAPI()

UPLOAD_FOLDER = "uploads"
RESULT_FILE = "fused.jpg"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def fuse_images(path1, path2, output_path):
    img1 = cv2.imread(path1)
    img2 = cv2.imread(path2)

    # Resize second image to match first
    img2 = cv2.resize(img2, (img1.shape[1], img1.shape[0]))

    # Weighted fusion
    fused = cv2.addWeighted(img1, 0.5, img2, 0.5, 0)

    cv2.imwrite(output_path, fused)
    return output_path

@app.post("/fuse")
async def fuse(file1: UploadFile = File(...), file2: UploadFile = File(...)):
    path1 = os.path.join(UPLOAD_FOLDER, file1.filename)
    path2 = os.path.join(UPLOAD_FOLDER, file2.filename)

    with open(path1, "wb") as buffer:
        shutil.copyfileobj(file1.file, buffer)

    with open(path2, "wb") as buffer:
        shutil.copyfileobj(file2.file, buffer)

    fused_path = fuse_images(path1, path2, RESULT_FILE)
    return FileResponse(fused_path, media_type="image/jpeg")
