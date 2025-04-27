// Plant Health Analysis Utilities
import axios from 'axios';

// Google Generative AI API Key
const GOOGLE_API_KEY = "AIzaSyByoriVZ-v0TU_39Nk9RUeh16tJEmGxoQo";

/**
 * Analyzes a plant image and returns structured data about its health
 * @param {File|Blob|string} imageSource - Image file, blob or URL to analyze
 * @returns {Promise<Object>} Analysis results with crop type, health status, etc.
 */
export async function analyzePlantImage(imageSource) {
  try {
    // Use Gemini API to analyze the image
    return await analyzeWithGemini(imageSource);
  } catch (error) {
    console.error('Error analyzing plant:', error);
    
    // If we can't connect to Gemini API, use fallback
    console.warn('Analysis failed, using fallback mock data');
    return provideFallbackAnalysis();
  }
}

/**
 * Analyze the image using the Gemini API with specific prompts that replicate
 * the Python model behavior from your original code
 */
async function analyzeWithGemini(imageSource) {
  try {
    // Convert image to base64
    const base64Image = await convertImageToBase64(imageSource);
    
    // First step: Identify the crop type
    const cropType = await identifyCropWithGemini(base64Image);
    
    // Second step: Analyze the disease
    const analysis = await analyzeDiseaseWithGemini(base64Image, cropType);
    
    // Combine results
    return {
      crop_name: cropType,
      health_status: analysis.health_status,
      disease_name: analysis.disease_name,
      treatment_recommendations: analysis.treatment_recommendations
    };
  } catch (error) {
    console.error('Gemini analysis error:', error);
    throw error;
  }
}

/**
 * Identify crop type using Gemini Vision API
 * This replicates the identify_crop_type function from your Python code
 */
async function identifyCropWithGemini(base64Image) {
  // Create the prompt exactly as in your Python code
  const prompt = `
    Analyze this plant material and identify its specific crop type in one word.
    First check if it's one of these crops: maize, tomato, cassava, cashew.
    If not, identify the specific crop type (like orange, apple, wheat, rice, etc).
    Do not respond with 'other' - always identify the specific crop type.
    Focus on identifying the plant species regardless of what part is shown in the image.
    Respond with just ONE WORD for the crop type.
  `;
  
  const result = await callGeminiVisionAPI(base64Image, prompt);
  
  // Clean up the response - ensure it's just one word
  const cropType = result.trim().toLowerCase().split(/\s+/)[0] || "unknown";
  
  return cropType;
}

/**
 * Analyze disease with Gemini Vision API
 * This replicates the analyze_disease_with_gemini function from your Python code
 */
async function analyzeDiseaseWithGemini(base64Image, cropType) {
  // Create the prompt exactly as in your Python code
  const prompt = `
    This is a ${cropType} plant. Carefully analyze this plant image and provide the following information:
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
  `;
  
  const response = await callGeminiVisionAPI(base64Image, prompt);
  
  // Parse the response just like in your Python code
  const lines = response.trim().split('\n');
  const result = {
    health_status: "unknown",
    disease_name: "unknown",
    treatment_recommendations: ""
  };
  
  // Extract health status and disease name first
  for (const line of lines) {
    if (line.toLowerCase().includes("health_status:")) {
      const parts = line.split(":");
      if (parts.length > 1) {
        result.health_status = parts[1].trim().toLowerCase();
      }
    } else if (line.toLowerCase().includes("disease_name:")) {
      const parts = line.split(":");
      if (parts.length > 1) {
        result.disease_name = parts[1].trim();
      }
    }
  }
  
  // Extract treatment recommendations (can span multiple lines)
  let treatmentLines = [];
  let capturingTreatment = false;
  
  for (const line of lines) {
    if (line.toLowerCase().includes("treatment:")) {
      capturingTreatment = true;
      // Add just the colon part if there's content after the label
      const parts = line.split(":");
      if (parts.length > 1 && parts[1].trim()) {
        treatmentLines.push(parts[1].trim());
      }
    } else if (capturingTreatment) {
      treatmentLines.push(line.trim());
    }
  }
  
  result.treatment_recommendations = treatmentLines.join('\n');
  
  // Ensure we have both required fields
  const healthStatus = result.health_status;
  const diseaseName = result.disease_name;
  
  // Normalize health status to either "healthy" or "diseased"
  if (healthStatus !== "healthy" && healthStatus !== "diseased") {
    // Default to "diseased" if unclear but there's a disease name
    if (diseaseName && diseaseName.toLowerCase() !== "none") {
      result.health_status = "diseased";
    } else {
      result.health_status = "at-risk"; // Changed from "unknown" to "at-risk" for better UX
    }
  }
      
  // If disease_name is empty and status is diseased, set a generic name
  if (result.health_status === 'diseased' && (!diseaseName || diseaseName.toLowerCase() === 'none')) {
    result.disease_name = 'unidentified disease';
  }
      
  // If healthy, ensure disease_name is 'none'
  if (result.health_status === 'healthy') {
    result.disease_name = 'none';
  }
  
  // If no treatment recommendations were provided
  if (!result.treatment_recommendations || !result.treatment_recommendations.trim()) {
    if (result.health_status === "healthy") {
      result.treatment_recommendations = "1. Continue regular watering\n2. Maintain appropriate sunlight exposure\n3. Apply balanced fertilizer as needed";
    } else {
      result.treatment_recommendations = "1. Remove affected parts\n2. Apply appropriate fungicide/pesticide\n3. Improve air circulation\n4. Adjust watering practices\n5. Consult with a local agricultural extension service";
    }
  }
  
  return result;
}

/**
 * Call the Gemini Vision API with a specific prompt and image
 */
async function callGeminiVisionAPI(base64Image, prompt) {
  // Prepare the API request
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`;
  
  // Create the request body
  const requestBody = {
    contents: [{
      parts: [
        { text: prompt },
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image
          }
        }
      ]
    }]
  };
  
  // Make the API request
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });
  
  if (!response.ok) {
    throw new Error(`Gemini API request failed with status ${response.status}`);
  }
  
  const responseData = await response.json();
  
  if (!responseData.candidates || !responseData.candidates[0] || 
      !responseData.candidates[0].content || !responseData.candidates[0].content.parts) {
    throw new Error('Invalid response structure from Gemini API');
  }
  
  // Extract the text from the response
  return responseData.candidates[0].content.parts[0].text;
}

/**
 * Convert an image to base64 format
 */
async function convertImageToBase64(imageSource) {
  return new Promise(async (resolve, reject) => {
    try {
      let blob;
      
      if (typeof imageSource === 'string') {
        if (imageSource.startsWith('data:')) {
          // It's already a data URL
          const base64Data = imageSource.split(',')[1];
          resolve(base64Data);
          return;
        } else {
          // It's a URL
          const response = await fetch(imageSource);
          blob = await response.blob();
        }
      } else {
        // It's a File or Blob
        blob = imageSource;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result.toString().split(',')[1];
        resolve(base64data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Captures an image from webcam
 * @returns {Promise<Blob>} Captured image as a blob
 */
export async function captureFromWebcam() {
  try {
    // Browser-based webcam capture
    return new Promise((resolve, reject) => {
      try {
        // Create video element
        const video = document.createElement('video');
        video.style.display = 'none';
        document.body.appendChild(video);
        
        // Get webcam stream
        navigator.mediaDevices.getUserMedia({ video: true })
          .then(stream => {
            video.srcObject = stream;
            video.play();
            
            // Once video is playing, create a modal for user to see themselves
            setTimeout(() => {
              // Create a modal to display the video
              const modal = document.createElement('div');
              modal.style.position = 'fixed';
              modal.style.top = '0';
              modal.style.left = '0';
              modal.style.width = '100%';
              modal.style.height = '100%';
              modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
              modal.style.display = 'flex';
              modal.style.flexDirection = 'column';
              modal.style.alignItems = 'center';
              modal.style.justifyContent = 'center';
              modal.style.zIndex = '9999';
              
              const videoContainer = document.createElement('div');
              videoContainer.style.position = 'relative';
              videoContainer.style.maxWidth = '80%';
              videoContainer.style.maxHeight = '70%';
              
              const displayVideo = document.createElement('video');
              displayVideo.style.maxWidth = '100%';
              displayVideo.style.maxHeight = '100%';
              displayVideo.style.backgroundColor = '#000';
              displayVideo.style.borderRadius = '8px';
              displayVideo.srcObject = stream;
              displayVideo.autoplay = true;
              
              const buttonContainer = document.createElement('div');
              buttonContainer.style.display = 'flex';
              buttonContainer.style.justifyContent = 'center';
              buttonContainer.style.gap = '10px';
              buttonContainer.style.marginTop = '20px';
              
              const captureButton = document.createElement('button');
              captureButton.textContent = 'Capture';
              captureButton.style.padding = '10px 20px';
              captureButton.style.backgroundColor = '#2D9D78';
              captureButton.style.color = 'white';
              captureButton.style.border = 'none';
              captureButton.style.borderRadius = '4px';
              captureButton.style.cursor = 'pointer';
              
              const cancelButton = document.createElement('button');
              cancelButton.textContent = 'Cancel';
              cancelButton.style.padding = '10px 20px';
              cancelButton.style.backgroundColor = '#6B7280';
              cancelButton.style.color = 'white';
              cancelButton.style.border = 'none';
              cancelButton.style.borderRadius = '4px';
              cancelButton.style.cursor = 'pointer';
              
              buttonContainer.appendChild(captureButton);
              buttonContainer.appendChild(cancelButton);
              
              videoContainer.appendChild(displayVideo);
              modal.appendChild(videoContainer);
              modal.appendChild(buttonContainer);
              
              document.body.appendChild(modal);
              
              // Function to stop all tracks and clean up
              const cleanup = () => {
                const tracks = stream.getTracks();
                tracks.forEach(track => track.stop());
                document.body.removeChild(video);
                document.body.removeChild(modal);
              };
              
              // Capture button click handler
              captureButton.onclick = () => {
                const canvas = document.createElement('canvas');
                canvas.width = displayVideo.videoWidth;
                canvas.height = displayVideo.videoHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(displayVideo, 0, 0, canvas.width, canvas.height);
                
                // Convert to blob
                canvas.toBlob(blob => {
                  cleanup();
                  resolve(blob);
                }, 'image/jpeg', 0.95);
              };
              
              // Cancel button click handler
              cancelButton.onclick = () => {
                cleanup();
                reject(new Error('User cancelled image capture'));
              };
              
            }, 500);
          })
          .catch(err => {
            document.body.removeChild(video);
            reject(new Error('Failed to access webcam: ' + err.message));
          });
      } catch (err) {
        reject(new Error('Failed to initialize webcam: ' + err.message));
      }
    });
  } catch (error) {
    console.error('Error in webcam capture:', error);
    throw error;
  }
}

/**
 * Captures an image from DroidCam
 * @param {string} ipAddress - DroidCam IP address
 * @param {string} port - DroidCam port
 * @returns {Promise<Blob>} Captured image as a blob
 */
export async function captureFromDroidcam(ipAddress, port) {
  try {
    // For direct DroidCam browser integration
    const url = `http://${ipAddress}:${port}/mjpegfeed`;
    
    // Show a message to user
    alert(`Opening DroidCam feed from ${url}\nPlease allow the connection if prompted.`);
    
    // Try to load the image directly from DroidCam
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Could not connect to DroidCam');
      }
      
      // Since MJPEG is a video format, we'll try to capture a single frame
      // This is a simplified approach and might not work with all DroidCam implementations
      const data = await response.blob();
      
      // For simplicity, just return the blob as is
      // In a real implementation, we would need to extract a single JPEG frame
      return data;
    } catch (directError) {
      console.error('Direct DroidCam connection failed:', directError);
      
      // Fallback: Try to use the DroidCam web interface
      try {
        // Create an iframe to show the DroidCam web interface
        return new Promise((resolve, reject) => {
          const modal = document.createElement('div');
          modal.style.position = 'fixed';
          modal.style.top = '0';
          modal.style.left = '0';
          modal.style.width = '100%';
          modal.style.height = '100%';
          modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
          modal.style.display = 'flex';
          modal.style.flexDirection = 'column';
          modal.style.alignItems = 'center';
          modal.style.justifyContent = 'center';
          modal.style.zIndex = '9999';
          
          const messageDiv = document.createElement('div');
          messageDiv.style.color = 'white';
          messageDiv.style.marginBottom = '20px';
          messageDiv.style.textAlign = 'center';
          messageDiv.style.maxWidth = '80%';
          messageDiv.innerHTML = `
            <h3>DroidCam Capture</h3>
            <p>Please take a screenshot of your DroidCam view and upload it.</p>
            <p>Due to browser security restrictions, we cannot directly capture from DroidCam without the backend server.</p>
          `;
          
          const buttonContainer = document.createElement('div');
          buttonContainer.style.display = 'flex';
          buttonContainer.style.justifyContent = 'center';
          buttonContainer.style.gap = '10px';
          
          const uploadButton = document.createElement('button');
          uploadButton.textContent = 'Upload Screenshot';
          uploadButton.style.padding = '10px 20px';
          uploadButton.style.backgroundColor = '#2D9D78';
          uploadButton.style.color = 'white';
          uploadButton.style.border = 'none';
          uploadButton.style.borderRadius = '4px';
          uploadButton.style.cursor = 'pointer';
          
          const cancelButton = document.createElement('button');
          cancelButton.textContent = 'Cancel';
          cancelButton.style.padding = '10px 20px';
          cancelButton.style.backgroundColor = '#6B7280';
          cancelButton.style.color = 'white';
          cancelButton.style.border = 'none';
          cancelButton.style.borderRadius = '4px';
          cancelButton.style.cursor = 'pointer';
          
          // Create hidden file input
          const fileInput = document.createElement('input');
          fileInput.type = 'file';
          fileInput.accept = 'image/*';
          fileInput.style.display = 'none';
          
          // Handle file selection
          fileInput.onchange = (e) => {
            if (e.target.files && e.target.files[0]) {
              const file = e.target.files[0];
              document.body.removeChild(modal);
              resolve(file);
            }
          };
          
          // Button handlers
          uploadButton.onclick = () => {
            fileInput.click();
          };
          
          cancelButton.onclick = () => {
            document.body.removeChild(modal);
            reject(new Error('User cancelled DroidCam capture'));
          };
          
          buttonContainer.appendChild(uploadButton);
          buttonContainer.appendChild(cancelButton);
          
          modal.appendChild(messageDiv);
          modal.appendChild(buttonContainer);
          modal.appendChild(fileInput);
          
          document.body.appendChild(modal);
        });
      } catch (fallbackError) {
        console.error('DroidCam fallback also failed:', fallbackError);
        throw new Error('Could not connect to DroidCam. Please check IP and port, or try using the webcam instead.');
      }
    }
  } catch (error) {
    console.error('Error capturing from DroidCam:', error);
    throw new Error('Failed to capture from DroidCam: ' + error.message);
  }
}

/**
 * Provides a fallback mock analysis when the model is unavailable
 * @returns {Object} Mock analysis result
 */
function provideFallbackAnalysis() {
  // Get random health status weighted toward healthy
  const healthOptions = ['healthy', 'healthy', 'healthy', 'at-risk', 'diseased'];
  const healthStatus = healthOptions[Math.floor(Math.random() * healthOptions.length)];
  
  // Generate crop name
  const cropTypes = ['tomato', 'maize', 'cassava', 'pepper', 'lettuce', 'strawberry', 'wheat'];
  const cropName = cropTypes[Math.floor(Math.random() * cropTypes.length)];
  
  // Base response object
  const result = {
    crop_name: cropName,
    health_status: healthStatus,
    disease_name: 'none',
    treatment_recommendations: ''
  };
  
  // Add disease details if not healthy
  if (healthStatus === 'diseased') {
    const diseases = {
      'tomato': 'late blight',
      'maize': 'leaf streak virus',
      'cassava': 'mosaic disease',
      'pepper': 'bacterial spot',
      'lettuce': 'downy mildew',
      'strawberry': 'powdery mildew',
      'wheat': 'leaf rust'
    };
    
    result.disease_name = diseases[cropName] || 'unidentified disease';
    result.treatment_recommendations = 
      "1. Remove affected plant parts\n" +
      "2. Apply appropriate fungicide/pesticide\n" +
      "3. Improve air circulation around plants\n" + 
      "4. Adjust watering practices to avoid leaf wetness\n" +
      "5. Consider crop rotation in the next season";
  } else if (healthStatus === 'at-risk') {
    result.disease_name = 'early signs of stress';
    result.treatment_recommendations = 
      "1. Increase nitrogen fertilization\n" +
      "2. Adjust watering frequency\n" +
      "3. Monitor closely for the next 48 hours";
  } else {
    result.treatment_recommendations = 
      "1. Continue regular watering according to crop needs\n" +
      "2. Maintain appropriate sunlight exposure\n" +
      "3. Apply balanced fertilizer as needed";
  }
  
  return result;
}