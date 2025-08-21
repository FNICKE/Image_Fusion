from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
import shutil
import os
import json
from typing import List
from datetime import datetime
import uuid

app = FastAPI(title="DisasterScope Image Fusion API", description="Advanced image fusion for disaster analysis")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_FOLDER = "uploads"
RESULT_FOLDER = "results"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULT_FOLDER, exist_ok=True)

class FusionAnalyzer:
    """Advanced image fusion with analysis capabilities for disaster assessment"""
    
    @staticmethod
    def analyze_image_quality(img):
        """Analyze image quality metrics for disaster imagery"""
        if len(img.shape) == 3:
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        else:
            gray = img
            
        # Calculate quality metrics
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        brightness = np.mean(gray)
        contrast = np.std(gray)
        
        # Noise estimation
        mean_intensity = np.mean(gray)
        noise_estimate = np.std(gray[gray < mean_intensity * 0.1])
        snr = mean_intensity / max(noise_estimate, 1)
        
        # Edge density (useful for disaster damage assessment)
        edges = cv2.Canny(gray, 50, 150)
        edge_density = np.sum(edges > 0) / (gray.shape[0] * gray.shape[1])
        
        return {
            "sharpness": float(laplacian_var),
            "brightness": float(brightness),
            "contrast": float(contrast),
            "snr": float(snr),
            "edge_density": float(edge_density)
        }
    
    @staticmethod
    def weighted_fusion(images, weights=None):
        """Weighted average fusion - fast and effective for general use"""
        if weights is None:
            weights = [1.0/len(images)] * len(images)
        
        target_shape = images[0].shape
        resized_images = []
        
        for img in images:
            if img.shape != target_shape:
                resized = cv2.resize(img, (target_shape[1], target_shape[0]))
                resized_images.append(resized.astype(np.float32))
            else:
                resized_images.append(img.astype(np.float32))
        
        fused = np.zeros_like(resized_images[0])
        for i, img in enumerate(resized_images):
            fused += weights[i] * img
            
        return np.clip(fused, 0, 255).astype(np.uint8)
    
    @staticmethod
    def laplacian_pyramid_fusion(images):
        """Laplacian pyramid fusion - best for preserving fine details in disaster imagery"""
        if len(images) < 2:
            return images[0]
            
        target_shape = images[0].shape
        resized_images = []
        
        for img in images:
            if img.shape != target_shape:
                resized = cv2.resize(img, (target_shape[1], target_shape[0]))
                resized_images.append(resized.astype(np.float32))
            else:
                resized_images.append(img.astype(np.float32))
        
        result = resized_images[0].copy()
        
        for i in range(1, len(resized_images)):
            img1 = result.astype(np.float32)
            img2 = resized_images[i].astype(np.float32)
            
            levels = 4
            
            # Generate Gaussian pyramids
            G1 = img1.copy()
            G2 = img2.copy()
            gp1 = [G1]
            gp2 = [G2]
            
            for j in range(levels):
                G1 = cv2.pyrDown(G1)
                G2 = cv2.pyrDown(G2)
                gp1.append(G1)
                gp2.append(G2)
            
            # Generate Laplacian pyramids
            lp1 = [gp1[levels-1]]
            lp2 = [gp2[levels-1]]
            
            for j in range(levels-1, 0, -1):
                size = (gp1[j-1].shape[1], gp1[j-1].shape[0])
                L1 = cv2.subtract(gp1[j-1], cv2.pyrUp(gp1[j], dstsize=size))
                L2 = cv2.subtract(gp2[j-1], cv2.pyrUp(gp2[j], dstsize=size))
                lp1.append(L1)
                lp2.append(L2)
            
            # Blend pyramids with activity-based selection
            LS = []
            for k, (l1, l2) in enumerate(zip(lp1, lp2)):
                if k < len(lp1) - 1:
                    activity1 = cv2.filter2D(np.abs(l1), -1, np.ones((3,3)))
                    activity2 = cv2.filter2D(np.abs(l2), -1, np.ones((3,3)))
                    
                    selection = (activity1 >= activity2).astype(np.float32)
                    if len(selection.shape) == 2:
                        selection = np.stack([selection] * l1.shape[2], axis=2)
                    
                    ls = selection * l1 + (1 - selection) * l2
                else:
                    ls = 0.5 * l1 + 0.5 * l2
                
                LS.append(ls)
            
            # Reconstruct
            ls_reconstructed = LS[0]
            for j in range(1, levels):
                size = (LS[j].shape[1], LS[j].shape[0])
                ls_reconstructed = cv2.add(cv2.pyrUp(ls_reconstructed, dstsize=size), LS[j])
            
            result = np.clip(ls_reconstructed, 0, 255)
        
        return result.astype(np.uint8)
    
    @staticmethod
    def adaptive_fusion(images):
        """Adaptive fusion based on local statistics - optimal quality"""
        if len(images) < 2:
            return images[0]
        
        target_shape = images[0].shape
        resized_images = []
        
        for img in images:
            if img.shape != target_shape:
                resized = cv2.resize(img, (target_shape[1], target_shape[0]))
                resized_images.append(resized.astype(np.float32))
            else:
                resized_images.append(img.astype(np.float32))
        
        weights = []
        for img in resized_images:
            if len(img.shape) == 3:
                gray = cv2.cvtColor(img.astype(np.uint8), cv2.COLOR_BGR2GRAY)
            else:
                gray = img.astype(np.uint8)
            
            kernel = np.ones((5,5), np.float32) / 25
            local_mean = cv2.filter2D(gray.astype(np.float32), -1, kernel)
            local_variance = cv2.filter2D((gray.astype(np.float32) - local_mean)**2, -1, kernel)
            
            weight = local_variance / (np.max(local_variance) + 1e-8)
            if len(img.shape) == 3:
                weight = np.stack([weight] * img.shape[2], axis=2)
            weights.append(weight)
        
        total_weight = sum(weights)
        weights = [w / (total_weight + 1e-8) for w in weights]
        
        fused = np.zeros_like(resized_images[0])
        for img, weight in zip(resized_images, weights):
            fused += img * weight
        
        return np.clip(fused, 0, 255).astype(np.uint8)

def create_fusion_explanation(original_images, fused_image, method, processing_time):
    """Generate detailed explanation for disaster assessment context"""
    
    analyzer = FusionAnalyzer()
    
    # Analyze original images
    original_analyses = []
    for i, img in enumerate(original_images):
        analysis = analyzer.analyze_image_quality(img)
        original_analyses.append({
            f"image_{i+1}": analysis
        })
    
    # Analyze fused image
    fused_analysis = analyzer.analyze_image_quality(fused_image)
    
    # Calculate improvements
    avg_original_sharpness = np.mean([list(analysis.values())[0]["sharpness"] for analysis in original_analyses])
    avg_original_contrast = np.mean([list(analysis.values())[0]["contrast"] for analysis in original_analyses])
    avg_original_snr = np.mean([list(analysis.values())[0]["snr"] for analysis in original_analyses])
    avg_original_edge_density = np.mean([list(analysis.values())[0]["edge_density"] for analysis in original_analyses])
    
    sharpness_improvement = ((fused_analysis["sharpness"] - avg_original_sharpness) / max(avg_original_sharpness, 1)) * 100
    contrast_improvement = ((fused_analysis["contrast"] - avg_original_contrast) / max(avg_original_contrast, 1)) * 100
    snr_improvement = ((fused_analysis["snr"] - avg_original_snr) / max(avg_original_snr, 1)) * 100
    edge_improvement = ((fused_analysis["edge_density"] - avg_original_edge_density) / max(avg_original_edge_density, 1)) * 100
    
    # Method descriptions for disaster assessment
    method_descriptions = {
        "weighted": {
            "name": "Weighted Average Fusion",
            "description": "Optimal for quickly combining multiple drone images with balanced exposure and noise reduction. Ideal for initial disaster assessment where speed is crucial.",
            "benefits": ["Fast processing", "Noise reduction", "Balanced exposure", "Real-time capability"],
            "best_for": "Initial rapid assessment, real-time processing"
        },
        "laplacian": {
            "name": "Laplacian Pyramid Fusion",
            "description": "Multi-resolution analysis preserving fine structural details critical for damage assessment. Maintains edge information essential for identifying structural damage.",
            "benefits": ["Preserves fine details", "Enhanced edge definition", "Structural clarity", "Artifact reduction"],
            "best_for": "Detailed damage assessment, structural analysis"
        },
        "adaptive": {
            "name": "Adaptive Statistical Fusion",
            "description": "Context-aware fusion that adapts to local image characteristics. Optimizes quality based on regional content, perfect for complex disaster scenes with varying conditions.",
            "benefits": ["Context-aware processing", "Optimal local quality", "Intelligent blending", "Scene adaptation"],
            "best_for": "Complex scenes, varying lighting, detailed analysis"
        }
    }
    
    return {
        "fusion_method": method_descriptions.get(method, {"name": method, "description": "Custom fusion method"}),
        "processing_time": f"{processing_time:.2f} seconds",
        "disaster_assessment_context": {
            "suitability": get_disaster_assessment_rating(fused_analysis, method),
            "recommended_use_cases": get_use_case_recommendations(fused_analysis, method)
        },
        "quality_analysis": {
            "original_images": original_analyses,
            "fused_image": fused_analysis,
            "improvements": {
                "sharpness": f"{sharpness_improvement:+.1f}%",
                "contrast": f"{contrast_improvement:+.1f}%",
                "signal_to_noise": f"{snr_improvement:+.1f}%",
                "edge_definition": f"{edge_improvement:+.1f}%"
            }
        },
        "technical_details": {
            "number_of_images": len(original_images),
            "fusion_algorithm": method,
            "color_space": "BGR" if len(fused_image.shape) == 3 else "Grayscale",
            "resolution": f"{fused_image.shape[1]}x{fused_image.shape[0]}",
            "quality_score": calculate_overall_quality_score(fused_analysis)
        },
        "recommendations": get_fusion_recommendations(fused_analysis, method)
    }

def get_disaster_assessment_rating(analysis, method):
    """Rate suitability for disaster assessment"""
    score = 0
    
    if analysis["sharpness"] > 100:
        score += 25
    elif analysis["sharpness"] > 50:
        score += 15
    
    if analysis["contrast"] > 50:
        score += 25
    elif analysis["contrast"] > 30:
        score += 15
    
    if analysis["edge_density"] > 0.1:
        score += 25
    elif analysis["edge_density"] > 0.05:
        score += 15
    
    if analysis["snr"] > 10:
        score += 25
    elif analysis["snr"] > 5:
        score += 15
    
    if score >= 80:
        return "Excellent - Ideal for detailed damage assessment"
    elif score >= 60:
        return "Good - Suitable for most disaster analysis tasks"
    elif score >= 40:
        return "Fair - Adequate for basic assessment"
    else:
        return "Poor - Consider additional preprocessing"

def get_use_case_recommendations(analysis, method):
    """Recommend specific use cases based on image quality"""
    use_cases = []
    
    if analysis["edge_density"] > 0.1:
        use_cases.append("Structural damage assessment")
        use_cases.append("Building integrity analysis")
    
    if analysis["contrast"] > 50:
        use_cases.append("Debris field mapping")
        use_cases.append("Road damage evaluation")
    
    if analysis["sharpness"] > 100:
        use_cases.append("Fine detail inspection")
        use_cases.append("Infrastructure damage cataloging")
    
    if method == "laplacian":
        use_cases.append("Architectural damage documentation")
    
    if not use_cases:
        use_cases = ["General surveillance", "Area monitoring"]
    
    return use_cases

def calculate_overall_quality_score(analysis):
    """Calculate overall quality score (0-100)"""
    # Normalize metrics and weight them
    sharpness_norm = min(analysis["sharpness"] / 200, 1) * 30
    contrast_norm = min(analysis["contrast"] / 80, 1) * 25
    snr_norm = min(analysis["snr"] / 20, 1) * 25
    edge_norm = min(analysis["edge_density"] / 0.2, 1) * 20
    
    return round(sharpness_norm + contrast_norm + snr_norm + edge_norm)

def get_fusion_recommendations(analysis, method):
    """Provide specific recommendations for disaster assessment"""
    recommendations = []
    
    quality_score = calculate_overall_quality_score(analysis)
    
    if quality_score < 60:
        recommendations.append("Consider preprocessing original images with noise reduction before fusion")
    
    if analysis["contrast"] < 40:
        recommendations.append("Apply histogram equalization for better visibility of damage details")
    
    if analysis["edge_density"] < 0.05:
        recommendations.append("Use edge enhancement filters to improve structural detail visibility")
    
    if method == "weighted" and analysis["sharpness"] > 150:
        recommendations.append("Excellent sharpness achieved - suitable for detailed damage documentation")
    
    if method == "laplacian" and quality_score > 80:
        recommendations.append("Outstanding fusion quality - ideal for professional disaster assessment reports")
    
    if analysis["snr"] > 15:
        recommendations.append("Low noise levels achieved - image is suitable for automated damage detection algorithms")
    
    if len(recommendations) == 0:
        recommendations.append("Fusion results meet high standards for disaster assessment applications")
    
    return recommendations

@app.post("/fuse")
async def fuse_images(
    files: List[UploadFile] = File(...),
    method: str = "laplacian"
):
    """Fuse multiple disaster images using advanced algorithms"""
    try:
        if len(files) < 2:
            raise HTTPException(status_code=400, detail="At least 2 images required for fusion")
        
        if len(files) > 10:
            raise HTTPException(status_code=400, detail="Maximum 10 images allowed")
        
        start_time = datetime.now()
        
        images = []
        file_paths = []
        
        for i, file in enumerate(files):
            if not file.content_type.startswith('image/'):
                raise HTTPException(status_code=400, detail=f"File {file.filename} is not an image")
            
            file_path = os.path.join(UPLOAD_FOLDER, f"{uuid.uuid4()}_{file.filename}")
            file_paths.append(file_path)
            
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            img = cv2.imread(file_path)
            if img is None:
                raise HTTPException(status_code=400, detail=f"Cannot read image {file.filename}")
            images.append(img)
        
        # Perform fusion
        analyzer = FusionAnalyzer()
        
        if method == "weighted":
            fused_image = analyzer.weighted_fusion(images)
        elif method == "laplacian":
            fused_image = analyzer.laplacian_pyramid_fusion(images)
        elif method == "adaptive":
            fused_image = analyzer.adaptive_fusion(images)
        else:
            fused_image = analyzer.laplacian_pyramid_fusion(images)
        
        # Save result
        result_filename = f"fused_{method}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg"
        result_path = os.path.join(RESULT_FOLDER, result_filename)
        cv2.imwrite(result_path, fused_image, [cv2.IMWRITE_JPEG_QUALITY, 95])
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        # Generate explanation
        explanation = create_fusion_explanation(images, fused_image, method, processing_time)
        
        # Save explanation
        explanation_path = os.path.join(RESULT_FOLDER, f"explanation_{result_filename}.json")
        with open(explanation_path, 'w') as f:
            json.dump(explanation, f, indent=2)
        
        # Cleanup
        for file_path in file_paths:
            if os.path.exists(file_path):
                os.remove(file_path)
        
        return FileResponse(
            result_path, 
            media_type="image/jpeg",
            filename=result_filename,
            headers={
                "X-Fusion-Method": method,
                "X-Processing-Time": str(processing_time),
                "X-Quality-Score": str(explanation["technical_details"]["quality_score"])
            }
        )
        
    except Exception as e:
        for file_path in file_paths:
            if os.path.exists(file_path):
                os.remove(file_path)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/explanation/{image_name}")
async def get_explanation(image_name: str):
    """Get detailed explanation for disaster assessment"""
    try:
        explanation_path = os.path.join(RESULT_FOLDER, f"explanation_{image_name}")
        
        if not os.path.exists(explanation_path):
            raise HTTPException(status_code=404, detail="Explanation not found")
        
        with open(explanation_path, 'r') as f:
            explanation = json.load(f)
        
        return JSONResponse(content=explanation)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/fusion-methods")
async def get_fusion_methods():
    """Get available fusion methods optimized for disaster assessment"""
    return {
        "methods": {
            "weighted": {
                "name": "Weighted Average Fusion",
                "description": "Fast processing for rapid disaster assessment",
                "best_for": "Initial response, real-time processing",
                "speed": "Fast (< 2 seconds)",
                "quality": "Good",
                "use_cases": ["Emergency response", "Quick overview", "Real-time analysis"]
            },
            "laplacian": {
                "name": "Laplacian Pyramid Fusion",
                "description": "Preserves structural details for damage assessment",
                "best_for": "Detailed damage analysis, documentation",
                "speed": "Medium (2-5 seconds)",
                "quality": "Excellent",
                "use_cases": ["Structural assessment", "Insurance documentation", "Detailed reports"]
            },
            "adaptive": {
                "name": "Adaptive Statistical Fusion",
                "description": "Context-aware fusion for complex disaster scenes",
                "best_for": "Complex scenes, varying conditions",
                "speed": "Slower (3-8 seconds)",
                "quality": "Superior",
                "use_cases": ["Complex disaster zones", "Multi-hazard assessment", "Research analysis"]
            }
        },
        "recommendations": {
            "emergency_response": "weighted",
            "detailed_assessment": "laplacian",
            "research_analysis": "adaptive"
        }
    }

@app.get("/health")
async def health_check():
    """Health check for DisasterScope API"""
    return {
        "status": "healthy",
        "service": "DisasterScope Image Fusion API",
        "version": "2.0.0",
        "capabilities": [
            "Multi-image fusion (2-10 images)",
            "Advanced fusion algorithms",
            "Disaster assessment optimization",
            "Quality analysis and reporting"
        ],
        "supported_formats": ["JPEG", "PNG", "BMP", "TIFF"],
        "max_images": 10,
        "fusion_methods": 3
    }

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting DisasterScope Image Fusion API...")
    print("📊 Fusion methods: weighted, laplacian, adaptive")
    print("🔗 API docs: http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)