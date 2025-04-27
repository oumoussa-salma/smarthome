from flask import Flask, request, render_template, jsonify, redirect, url_for
import os
from werkzeug.utils import secure_filename
from works2_merged import analyze_plant, capture_from_droidcam, capture_from_webcam
import json
import cors

app = Flask(__name__)
# Enable CORS
app.config['CORS_HEADERS'] = 'Content-Type'
cors = cors.CORS(app, resources={r"/*": {"origins": "*"}})

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size

# Create uploads directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    # Check if the post request has the file part
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})
    
    file = request.files['file']
    
    # If user does not select file, browser also
    # submit an empty part without filename
    if file.filename == '':
        return jsonify({'error': 'No selected file'})
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        # Analyze the uploaded image
        try:
            result = analyze_plant(file_path)
            return jsonify(result)
        except Exception as e:
            return jsonify({'error': str(e)})
    
    return jsonify({'error': 'File type not allowed'})

@app.route('/droidcam', methods=['GET'])
def droidcam_page():
    """Show the DroidCam configuration page"""
    return render_template('droidcam.html')

@app.route('/webcam', methods=['GET'])
def webcam_page():
    """Show the webcam capture page"""
    return render_template('webcam.html')

@app.route('/capture-droidcam', methods=['POST'])
def capture_droidcam_route():
    """Capture image from DroidCam and analyze it"""
    try:
        ip_address = request.form.get('ip_address', '192.168.1.2')
        port = request.form.get('port', '4747')
        
        # Generate a unique filename for the captured image
        import time
        timestamp = int(time.time())
        save_path = os.path.join(app.config['UPLOAD_FOLDER'], f'droidcam_{timestamp}.jpg')
        
        # Capture image from DroidCam
        image_path = capture_from_droidcam(
            ip_address=ip_address, 
            port=port, 
            save_path=save_path, 
            timeout=30
        )
        
        if not image_path:
            return jsonify({
                'error': 'Failed to capture image from DroidCam. Please check your connection settings.',
                'status': 'error'
            })
        
        # Analyze the captured image
        result = analyze_plant(image_path)
        
        # Add the image path to the result
        result['image_path'] = image_path
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'error': f'Error: {str(e)}',
            'status': 'error'
        })

@app.route('/capture-webcam', methods=['POST'])
def capture_webcam_route():
    """Capture image from webcam and analyze it"""
    try:
        # Generate a unique filename for the captured image
        import time
        timestamp = int(time.time())
        save_path = os.path.join(app.config['UPLOAD_FOLDER'], f'webcam_{timestamp}.jpg')
        
        # Capture image from webcam
        image_path = capture_from_webcam(
            save_path=save_path,
            timeout=30
        )
        
        if not image_path:
            return jsonify({
                'error': 'Failed to capture image from webcam. Please check if your webcam is connected.',
                'status': 'error'
            })
        
        # Analyze the captured image
        result = analyze_plant(image_path)
        
        # Add the image path to the result
        result['image_path'] = image_path
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'error': f'Error: {str(e)}',
            'status': 'error'
        })

if __name__ == '__main__':
    app.run(debug=True)