import torch
from transformers import ViTForImageClassification, ViTFeatureExtractor
from PIL import Image
import requests
from io import BytesIO
import json
import google.generativeai as genai
import cv2
import time
import urllib.request
import numpy as np


# Configure Gemini API key
GOOGLE_API_KEY = "AIzaSyByoriVZ-v0TU_39Nk9RUeh16tJEmGxoQo"  # Replace with your actual API key
genai.configure(api_key=GOOGLE_API_KEY)

def capture_from_droidcam(ip_address="192.168.1.2", port="4747", save_path="captured_leaf.jpg", timeout=10):
    """
    Capture an image from DroidCam app running on a smartphone
    
    Args:
        ip_address: IP address of the phone (check in DroidCam app)
        port: Port used by DroidCam (default is 4747)
        save_path: Path to save the captured image
        timeout: Timeout in seconds for capture
    
    Returns:
        Path to saved image if successful, None otherwise
    """
    try:
        # Construct URL for DroidCam video feed
        url = f"http://{ip_address}:{port}/video"
        
        # Open video capture from the URL
        cap = cv2.VideoCapture(url)
        
        if not cap.isOpened():
            print(f"Error: Could not connect to DroidCam at {url}")
            return None
        
        print("Connected to DroidCam. Position the plant/leaf and press 's' to capture.")
        print("Press 'q' to quit without capturing.")
        
        start_time = time.time()
        
        while True:
            # Check for timeout
            if time.time() - start_time > timeout:
                print("Timeout: No image captured.")
                cap.release()
                cv2.destroyAllWindows()
                return None
            
            # Read frame from video stream
            ret, frame = cap.read()
            if not ret:
                print("Error: Failed to receive frame from DroidCam.")
                cap.release()
                cv2.destroyAllWindows()
                return None
            
            # Display frame
            cv2.imshow('DroidCam - Position plant/leaf', frame)
            
            # Check for key press
            key = cv2.waitKey(1) & 0xFF
            if key == ord('s'):
                # Save the captured image
                cv2.imwrite(save_path, frame)
                print(f"Image captured and saved to {save_path}")
                cap.release()
                cv2.destroyAllWindows()
                return save_path
            elif key == ord('q'):
                print("Capture cancelled.")
                cap.release()
                cv2.destroyAllWindows()
                return None
                
    except Exception as e:
        print(f"Error capturing from DroidCam: {e}")
        try:
            cap.release()
            cv2.destroyAllWindows()
        except:
            pass
        return None

def capture_from_webcam(save_path="captured_leaf.jpg", timeout=30, camera_index=0):
    """
    Capture an image from the computer's webcam
    
    Args:
        save_path: Path to save the captured image
        timeout: Timeout in seconds for capture
        camera_index: Index of the camera to use (default is 0 for built-in webcam)
    
    Returns:
        Path to saved image if successful, None otherwise
    """
    try:
        # Open video capture from the default webcam
        cap = cv2.VideoCapture(camera_index)
        
        if not cap.isOpened():
            print("Error: Could not access webcam. Make sure it's connected and not being used by another application.")
            return None
        
        print("Webcam activated. Position the plant/leaf and press 's' to capture.")
        print("Press 'q' to quit without capturing.")
        
        start_time = time.time()
        
        while True:
            # Check for timeout
            if time.time() - start_time > timeout:
                print("Timeout: No image captured.")
                cap.release()
                cv2.destroyAllWindows()
                return None
            
            # Read frame from webcam
            ret, frame = cap.read()
            if not ret:
                print("Error: Failed to capture frame from webcam.")
                cap.release()
                cv2.destroyAllWindows()
                return None
            
            # Display frame
            cv2.imshow('Webcam - Position plant/leaf', frame)
            
            # Check for key press
            key = cv2.waitKey(1) & 0xFF
            if key == ord('s'):
                # Save the captured image
                cv2.imwrite(save_path, frame)
                print(f"Image captured and saved to {save_path}")
                cap.release()
                cv2.destroyAllWindows()
                return save_path
            elif key == ord('q'):
                print("Capture cancelled.")
                cap.release()
                cv2.destroyAllWindows()
                return None
                
    except Exception as e:
        print(f"Error capturing from webcam: {e}")
        try:
            cap.release()
            cv2.destroyAllWindows()
        except:
            pass
        return None

def identify_crop_type(image_path):
    """
    Use Gemini API to identify the crop type from the image
    """
    try:
        # Initialize Gemini vision model
        vision_model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Load the image
        image = Image.open(image_path)
        
        # Generate content about the image - expanded crop list
        prompt = """
        Analyze this plant material and identify its specific crop type in one word.
        First check if it's one of these crops: maize, tomato, cassava, cashew.
        If not, identify the specific crop type (like orange, apple, wheat, rice, etc).
        Do not respond with 'other' - always identify the specific crop type.
        Focus on identifying the plant species regardless of what part is shown in the image.
        Respond with just ONE WORD for the crop type.
        """
        response = vision_model.generate_content([prompt, image])
        
        # Convert response to lowercase for consistency
        crop_type = response.text.strip().lower()
        
        # Clean up the response - ensure it's just one word
        crop_type = crop_type.split()[0] if crop_type.split() else "unknown"
        
        return crop_type
    except Exception as e:
        return "unknown"

def analyze_disease_with_gemini(image_path, crop_type="unknown"):
    """
    Use Gemini to analyze plant disease and return structured data including treatment recommendations
    """
    try:
        # Initialize Gemini vision model
        vision_model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Load the image
        image = Image.open(image_path)
        
        # Create a prompt that asks for specifically structured analysis including treatment recommendations
        prompt = f"""
        This is a {crop_type} plant. Carefully analyze this plant image and provide the following information:
        1. Health status: You must choose ONLY one of these two values: "healthy" or "diseased" 
        2. If diseased, what is the specific disease name (use accepted plant pathology terminology)
        3. Treatment recommendations: Provide 3-5 specific, practical ways to treat or manage this disease. 
           If healthy, provide 2-3 general care tips for maintaining plant health.
        
        Format your response exactly like this:
        health_status: [healthy or diseased]
        disease_name: [disease name or 'none' if healthy]
        treatment: [numbered list of recommendations]
        
        Be very careful to accurately determine if the plant shows actual disease symptoms.
        For citrus plants like orange or lemon, be sure to check for citrus canker, greening, black spot, etc.
        """
        
        # Generate the analysis
        response = vision_model.generate_content([prompt, image])
        
        # Parse the response
        lines = response.text.strip().split('\n')
        result = {}
        
        # Extract health status and disease name first
        for line in lines:
            if "health_status:" in line.lower():
                result["health_status"] = line.split(':', 1)[1].strip().lower()
            elif "disease_name:" in line.lower():
                result["disease_name"] = line.split(':', 1)[1].strip()
        
        # Extract treatment recommendations (can span multiple lines)
        treatment_lines = []
        capturing_treatment = False
        
        for line in lines:
            if "treatment:" in line.lower():
                capturing_treatment = True
                # Add just the colon part if there's content after the label
                if len(line.split(':', 1)) > 1 and line.split(':', 1)[1].strip():
                    treatment_lines.append(line.split(':', 1)[1].strip())
            elif capturing_treatment:
                treatment_lines.append(line.strip())
        
        result["treatment_recommendations"] = '\n'.join(treatment_lines)
        
        # Ensure we have both required fields
        health_status = result.get('health_status', '').lower()
        disease_name = result.get('disease_name', '')
        
        # Normalize health status to either "healthy" or "diseased"
        if health_status not in ["healthy", "diseased"]:
            # Default to "diseased" if unclear but there's a disease name
            if disease_name and disease_name.lower() != "none":
                health_status = "diseased"
            else:
                health_status = "unknown"
                
        # If disease_name is empty and status is diseased, set a generic name
        if health_status == 'diseased' and (not disease_name or disease_name.lower() == 'none'):
            disease_name = 'unidentified disease'
            
        # If healthy, ensure disease_name is 'none'
        if health_status == 'healthy':
            disease_name = 'none'
        
        # If no treatment recommendations were provided
        if "treatment_recommendations" not in result or not result["treatment_recommendations"].strip():
            if health_status == "healthy":
                result["treatment_recommendations"] = "1. Continue regular watering\n2. Maintain appropriate sunlight exposure\n3. Apply balanced fertilizer as needed"
            else:
                result["treatment_recommendations"] = "1. Remove affected parts\n2. Apply appropriate fungicide/pesticide\n3. Improve air circulation\n4. Adjust watering practices\n5. Consult with a local agricultural extension service"
            
        return {
            'health_status': health_status,
            'disease_name': disease_name,
            'treatment_recommendations': result.get('treatment_recommendations', '')
        }
    except Exception as e:
        return {
            'health_status': 'unknown',
            'disease_name': 'error analyzing image',
            'treatment_recommendations': 'Unable to provide recommendations due to analysis error'
        }

def load_model():
    """
    Load the ViT model fine-tuned for crop disease detection
    """
    try:
        model_name = "sabari15/ViT-base16-fine-tuned-crop-disease-model"
        feature_extractor = ViTFeatureExtractor.from_pretrained("google/vit-base-patch16-224")
        model = ViTForImageClassification.from_pretrained(model_name)
        return model, feature_extractor
    except Exception as e:
        print(f"Error loading model: {e}")
        # Return dummy model for demo purposes if model can't be loaded
        return None, None

def predict_disease(image_path, model, feature_extractor):
    """
    Predict crop disease from an image using the ViT model
    """
    if model is None or feature_extractor is None:
        # Return a fallback prediction for demo purposes
        return "Unable to use ViT model"
    
    try:
        # Load image
        if image_path.startswith(('http://', 'https://')):
            response = requests.get(image_path)
            image = Image.open(BytesIO(response.content))
        else:
            image = Image.open(image_path)
        
        # Convert image to RGB if needed
        if image.mode != "RGB":
            image = image.convert("RGB")
        
        # Preprocess the image
        inputs = feature_extractor(images=image, return_tensors="pt")
        
        # Make prediction
        with torch.no_grad():
            outputs = model(**inputs)
            logits = outputs.logits
        
        # Get predicted class
        predicted_class_idx = logits.argmax(-1).item()
        if hasattr(model.config, 'id2label') and model.config.id2label:
            predicted_class = model.config.id2label[predicted_class_idx]
        else:
            predicted_class = f"Class {predicted_class_idx}"
        
        return predicted_class
    except Exception as e:
        print(f"Error predicting disease: {e}")
        return "Error in prediction"

def analyze_plant(image_path):
    """
    Main function that analyzes a plant image and returns structured data
    with crop name, health status, disease name, and treatment recommendations
    """
    try:
        # Step 1: Identify the crop type using Gemini
        crop_type = identify_crop_type(image_path)
        
        result = {
            "crop_name": crop_type,
            "health_status": "",
            "disease_name": "",
            "treatment_recommendations": ""
        }
        
        # Load the model
        model, feature_extractor = load_model()
        
        # Supported crop types for the ViT model
        supported_crops = ["maize", "tomato", "cassava", "cashew"]
        
        # Step 2: Analyze based on crop type
        if crop_type in supported_crops and model is not None:
            # Use ViT model for supported crops
            prediction = predict_disease(image_path, model, feature_extractor)
            
            # Parse the prediction to extract health status and disease name
            prediction_lower = prediction.lower()
            
            if "healthy" in prediction_lower:
                result["health_status"] = "healthy"
                result["disease_name"] = "none"
                # Add general health maintenance tips
                result["treatment_recommendations"] = (
                    "1. Continue regular watering according to crop needs\n"
                    "2. Maintain appropriate sunlight exposure\n"
                    "3. Apply balanced fertilizer as needed"
                )
            else:
                result["health_status"] = "diseased"
                # Extract disease name by removing the crop name prefix
                disease_part = prediction_lower.replace(crop_type.lower(), "").strip()
                result["disease_name"] = disease_part if disease_part else "unidentified disease"
                
                # Get treatment recommendations from Gemini for more accurate information
                gemini_analysis = analyze_disease_with_gemini(image_path, crop_type)
                result["treatment_recommendations"] = gemini_analysis.get("treatment_recommendations", (
                    "1. Remove affected plant parts\n"
                    "2. Apply appropriate fungicide/pesticide\n"
                    "3. Improve air circulation around plants\n" 
                    "4. Adjust watering practices to avoid leaf wetness\n"
                    "5. Consider crop rotation in the next season"
                ))
        else:
            # For unsupported crops or if model failed to load, use Gemini
            gemini_result = analyze_disease_with_gemini(image_path, crop_type)
            result["health_status"] = gemini_result.get("health_status", "unknown")
            result["disease_name"] = gemini_result.get("disease_name", "unknown")
            result["treatment_recommendations"] = gemini_result.get("treatment_recommendations", "No specific recommendations available")
        
        return result
    except Exception as e:
        # If any error occurs, return a fallback response
        print(f"Error in analyze_plant: {e}")
        return {
            "crop_name": "unknown",
            "health_status": "unknown",
            "disease_name": "analysis error",
            "treatment_recommendations": "An error occurred during analysis. Please try again with a clearer image of the plant."
        }

def main(image_path=None):
    """
    Process an image and return structured output
    If no image path is provided, attempt to capture from DroidCam
    """
    if not image_path:
        # Ask user for DroidCam IP and port
        print("Enter DroidCam connection details:")
        ip = input("IP Address (default 192.168.1.2): ") or "192.168.1.2"
        port = input("Port (default 4747): ") or "4747"
        
        # Capture image from DroidCam
        image_path = capture_from_droidcam(ip_address=ip, port=port)
        
        if not image_path:
            return json.dumps({
                "error": "Failed to capture image from DroidCam",
                "status": "error"
            })
    
    # Analyze the image
    result = analyze_plant(image_path)
    return json.dumps(result)

# Example usage (only for testing, not part of the actual function)
if __name__ == "__main__":
    # Get input - either from DroidCam or path
    use_droidcam = input("Use DroidCam to capture image? (y/n): ").lower().startswith('y')
    
    if use_droidcam:
        # Capture from DroidCam
        result_json = main()
    else:
        # Get image path
        image_path = input("Enter image path: ")
        if not image_path:
            image_path = "test/maize-streak-virus-malawi-1.jpg"  # Default test image
        
        # Get results as JSON
        result_json = main(image_path)
    
    print(result_json)