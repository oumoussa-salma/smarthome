import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import IrrigationZoneCard from '../components/ui/IrrigationZoneCard';
import { irrigationZones, crops } from '../utils/mockData';
import { Droplets, Settings, BarChart, Clock, Camera, Upload, AlertTriangle, Sliders } from 'lucide-react';

// Available crop types that can be detected or selected
const CROP_TYPES = ["Wheat", "Rice", "Corn", "Potato", "Tomato", "Cotton", "Soybean", "Sugarcane"];

// Google Gemini API Key for crop detection
const GOOGLE_API_KEY = "AIzaSyCsK5tDbunTV3c0ZwiTzh8Xko2jXC8D4sI";

const Irrigation: React.FC = () => {
  const [zones, setZones] = useState(irrigationZones);
  const [showSmartIrrigation, setShowSmartIrrigation] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [cropDetectionResult, setCropDetectionResult] = useState<{
    crop_type: string;
    confidence: number;
  } | null>(null);
  const [sensorData, setSensorData] = useState({
    soil_moisture: 50, // Default values
    humidity: 60,
    temperature: 25,
    crop_type: ""
  });
  const [waterUsagePrediction, setWaterUsagePrediction] = useState<{
    water_usage_liters_per_sqm: number;
    debug_info?: any;
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleToggleAutomation = (zoneId: string, enabled: boolean) => {
    setZones(prevZones => 
      prevZones.map(zone => 
        zone.id === zoneId ? { ...zone, automationEnabled: enabled } : zone
      )
    );
  };
  
  const activateAllZones = () => {
    setZones(prevZones => 
      prevZones.map(zone => ({ ...zone, status: 'active', lastActivated: new Date() }))
    );
  };
  
  const deactivateAllZones = () => {
    setZones(prevZones => 
      prevZones.map(zone => ({ ...zone, status: 'inactive' }))
    );
  };
  
  // Calculate water usage statistics
  const totalWaterUsage = zones.reduce((total, zone) => {
    // Simple calculation based on duration and status
    const multiplier = zone.status === 'active' ? 1 : 0;
    return total + (zone.duration * 2.5 * multiplier); // 2.5 liters per minute as an example
  }, 0);
  
  const scheduledWaterUsage = zones.reduce((total, zone) => {
    if (zone.status === 'scheduled' && zone.nextScheduled) {
      return total + (zone.duration * 2.5);
    }
    return total;
  }, 0);
  
  // Function to handle file selection for crop detection
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(URL.createObjectURL(file));
      detectCropFromImage(file);
    }
  };
  
  // Function to trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Function to detect crop from image using Gemini API
  const detectCropFromImage = async (file: File) => {
    setIsAnalyzing(true);
    setCropDetectionResult(null);
    
    try {
      // Convert file to base64
      const base64Image = await fileToBase64(file);
      
      // Call Gemini API for crop detection
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`;
      
      const prompt = "Identify what crop is shown in this image. Reply with only one word from this list: Wheat, Rice, Corn, Potato, Tomato, Cotton, Soybean, Sugarcane. If you can't identify it as one of these crops, reply with 'Wheat'.";
      
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
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const responseData = await response.json();
      const detectedCrop = responseData.candidates[0].content.parts[0].text.trim();
      
      // Find matching crop from our list
      let matchedCrop = "Wheat"; // Default
      for (const crop of CROP_TYPES) {
        if (crop.toLowerCase() === detectedCrop.toLowerCase()) {
          matchedCrop = crop;
          break;
        }
      }
      
      // Set the result
      setCropDetectionResult({
        crop_type: matchedCrop,
        confidence: 0.9 // Gemini doesn't provide confidence scores, so we use a default
      });
      
      // Update sensor data with detected crop
      setSensorData(prev => ({
        ...prev,
        crop_type: matchedCrop
      }));
      
    } catch (error) {
      console.error("Error detecting crop:", error);
      // Set default crop on error
      setCropDetectionResult({
        crop_type: "Wheat",
        confidence: 0.5
      });
      setSensorData(prev => ({
        ...prev,
        crop_type: "Wheat"
      }));
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Extract the base64 part from the data URL
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = error => reject(error);
    });
  };
  
  // Function to predict water usage based on sensor data
  const predictWaterUsage = () => {
    setIsAnalyzing(true);
    
    try {
      // Use rule-based method to predict water usage
      const result = predictWaterUsageRuleBased(sensorData);
      setWaterUsagePrediction(result);
    } catch (error) {
      console.error("Error predicting water usage:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Rule-based water usage prediction (from your FastAPI logic)
  const predictWaterUsageRuleBased = (data: any) => {
    const { soil_moisture, humidity, temperature, crop_type } = data;
    
    const debug_info: any = {
      method: "rule_based",
      inputs: {
        soil_moisture,
        humidity,
        temperature,
        crop_type
      }
    };
    
    // Basic rule-based calculation (same as your Python code)
    let base_water = 0;
    
    // Adjust for soil moisture (lower moisture -> more water needed)
    const moisture_factor = Math.max(0, (100 - soil_moisture) / 100);
    
    // Adjust for temperature (higher temp -> more water needed)
    const temp_factor = Math.max(0, Math.min(1, (temperature + 10) / 50));
    
    // Adjust for humidity (lower humidity -> more water needed)
    const humidity_factor = Math.max(0, (100 - humidity) / 100);
    
    // Different crops have different base water requirements
    switch (crop_type) {
      case "Wheat": base_water = 4; break;
      case "Rice": base_water = 10; break;
      case "Corn": base_water = 6; break;
      case "Potato": base_water = 5; break;
      case "Tomato": base_water = 7; break;
      case "Cotton": base_water = 8; break;
      case "Soybean": base_water = 5; break;
      case "Sugarcane": base_water = 9; break;
      default: base_water = 5; break;
    }
    
    // Calculate water usage in liters per square meter
    const water_usage = base_water * 
      (0.5 + 0.5 * moisture_factor) * 
      (0.8 + 0.2 * temp_factor) * 
      (0.7 + 0.3 * humidity_factor);
    
    // Store calculation factors in debug info
    debug_info.factors = {
      base_water,
      moisture_factor: parseFloat(moisture_factor.toFixed(2)),
      temp_factor: parseFloat(temp_factor.toFixed(2)),
      humidity_factor: parseFloat(humidity_factor.toFixed(2))
    };
    
    debug_info.calculation = `${base_water} * (0.5 + 0.5 * ${moisture_factor.toFixed(2)}) * (0.8 + 0.2 * ${temp_factor.toFixed(2)}) * (0.7 + 0.3 * ${humidity_factor.toFixed(2)}) = ${water_usage.toFixed(2)}`;
    
    return {
      water_usage_liters_per_sqm: parseFloat(water_usage.toFixed(2)),
      debug_info
    };
  };
  
  return (
    <div className="p-4 sm:p-6 md:p-8">
      {/* System Controls */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Irrigation System Controls</h2>
          <div className="flex space-x-3">
            <button
              className="bg-error-500 hover:bg-error-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-error-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-200"
              onClick={deactivateAllZones}
            >
              Stop All Zones
            </button>
            <button
              className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-200"
              onClick={activateAllZones}
            >
              Activate All Zones
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            className="bg-secondary-50 dark:bg-secondary-900/30 rounded-md p-4 flex items-center"
            whileHover={{ y: -5 }}
          >
            <div className="bg-secondary-100 dark:bg-secondary-800 p-3 rounded-full">
              <Droplets className="h-6 w-6 text-secondary-600 dark:text-secondary-400" />
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-600 dark:text-gray-300">Current Water Usage</div>
              <div className="text-xl font-semibold text-gray-900 dark:text-white">{totalWaterUsage.toFixed(1)} L/min</div>
            </div>
          </motion.div>
          
          <motion.div 
            className="bg-primary-50 dark:bg-primary-900/30 rounded-md p-4 flex items-center"
            whileHover={{ y: -5 }}
          >
            <div className="bg-primary-100 dark:bg-primary-800 p-3 rounded-full">
              <Clock className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-600 dark:text-gray-300">Scheduled Usage</div>
              <div className="text-xl font-semibold text-gray-900 dark:text-white">{scheduledWaterUsage.toFixed(1)} L</div>
            </div>
          </motion.div>
          
          <motion.div 
            className="bg-gray-50 dark:bg-gray-700/30 rounded-md p-4 flex items-center"
            whileHover={{ y: -5 }}
          >
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full">
              <BarChart className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-600 dark:text-gray-300">Active Zones</div>
              <div className="text-xl font-semibold text-gray-900 dark:text-white">
                {zones.filter(zone => zone.status === 'active').length} / {zones.length}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Smart Irrigation System */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Smart Irrigation System</h2>
          <button
            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md p-1.5"
            onClick={() => setShowSmartIrrigation(!showSmartIrrigation)}
          >
            <Sliders className="h-5 w-5 mr-1.5" />
            <span className="text-sm font-medium">
              {showSmartIrrigation ? 'Hide Smart System' : 'Show Smart System'}
            </span>
          </button>
        </div>
        
        {showSmartIrrigation && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left column - Crop Detection */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">Crop Detection</h3>
                
                {/* Upload image section */}
                <div className="mb-4">
                  <div className="flex items-center justify-center">
                    {!selectedImage ? (
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center w-full">
                        <Camera className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                        <p className="text-gray-500 dark:text-gray-400 mb-3">
                          Upload a photo of your crop for automatic detection
                        </p>
                        <button
                          onClick={triggerFileInput}
                          disabled={isAnalyzing}
                          className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-200 disabled:opacity-50"
                        >
                          <Upload className="h-4 w-4 inline-block mr-2" />
                          Upload Image
                        </button>
                        <input 
                          ref={fileInputRef}
                          type="file" 
                          accept="image/*" 
                          className="hidden"
                          onChange={handleFileUpload} 
                        />
                      </div>
                    ) : (
                      <div className="w-full">
                        <div className="relative w-full h-48 mb-3">
                          <img 
                            src={selectedImage} 
                            alt="Crop" 
                            className="w-full h-full object-contain rounded-lg border border-gray-200 dark:border-gray-700" 
                          />
                          {isAnalyzing && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
                            </div>
                          )}
                        </div>
                        <div className="flex justify-between">
                          <button
                            onClick={() => {
                              setSelectedImage(null);
                              setCropDetectionResult(null);
                            }}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 underline text-sm"
                          >
                            Remove image
                          </button>
                          <button
                            onClick={triggerFileInput}
                            disabled={isAnalyzing}
                            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline text-sm"
                          >
                            Upload new image
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Detection result */}
                {cropDetectionResult && (
                  <div className="mt-4 p-3 bg-secondary-50 dark:bg-secondary-900/30 rounded-md">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Detection Results</h4>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-gray-600 dark:text-gray-300">Detected Crop:</span>
                        <span className="ml-2 text-gray-900 dark:text-white font-medium">
                          {cropDetectionResult.crop_type}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {Math.round(cropDetectionResult.confidence * 100)}% confidence
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Manual crop selection */}
                <div className="mt-5">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Or Select Crop Manually</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <select 
                      value={sensorData.crop_type}
                      onChange={(e) => setSensorData({...sensorData, crop_type: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select crop type</option>
                      {CROP_TYPES.map(crop => (
                        <option key={crop} value={crop}>{crop}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Right column - Sensor Data & Prediction */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">Water Usage Prediction</h3>
                
                {/* Sensor data inputs */}
                <div className="space-y-4 mb-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Soil Moisture (%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sensorData.soil_moisture}
                      onChange={(e) => setSensorData({...sensorData, soil_moisture: parseInt(e.target.value)})}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>Dry (0%)</span>
                      <span>{sensorData.soil_moisture}%</span>
                      <span>Wet (100%)</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Humidity (%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sensorData.humidity}
                      onChange={(e) => setSensorData({...sensorData, humidity: parseInt(e.target.value)})}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>Dry (0%)</span>
                      <span>{sensorData.humidity}%</span>
                      <span>Humid (100%)</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Temperature (°C)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={sensorData.temperature}
                      onChange={(e) => setSensorData({...sensorData, temperature: parseInt(e.target.value)})}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>0°C</span>
                      <span>{sensorData.temperature}°C</span>
                      <span>50°C</span>
                    </div>
                  </div>
                </div>
                
                {/* Calculate button */}
                <div className="mb-5">
                  <button
                    onClick={predictWaterUsage}
                    disabled={isAnalyzing || !sensorData.crop_type}
                    className="w-full bg-secondary-500 hover:bg-secondary-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-200 disabled:opacity-50"
                  >
                    {isAnalyzing ? (
                      <>Calculating...</>
                    ) : (
                      <>Calculate Optimal Water Usage</>
                    )}
                  </button>
                  
                  {!sensorData.crop_type && (
                    <p className="text-center text-warning-500 text-sm mt-2 flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Select or detect a crop type first
                    </p>
                  )}
                </div>
                
                {/* Prediction results */}
                {waterUsagePrediction && (
                  <div className="mt-4 p-4 bg-primary-50 dark:bg-primary-900/30 rounded-md">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Recommended Irrigation</h4>
                    
                    <div className="flex items-center justify-center mb-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                          {waterUsagePrediction.water_usage_liters_per_sqm}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Liters per square meter
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      <strong>Factors affecting this recommendation:</strong>
                    </div>
                    <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
                      <li>Crop type: <span className="font-medium">{sensorData.crop_type}</span> requires {waterUsagePrediction.debug_info?.factors.base_water} L/m² base water</li>
                      <li>Soil moisture: {100 - Math.round(waterUsagePrediction.debug_info?.factors.moisture_factor * 100)}% saturation</li>
                      <li>Temperature: {sensorData.temperature}°C (factor: {waterUsagePrediction.debug_info?.factors.temp_factor.toFixed(2)})</li>
                      <li>Humidity: {sensorData.humidity}% (factor: {waterUsagePrediction.debug_info?.factors.humidity_factor.toFixed(2)})</li>
                    </ul>
                    
                    <div className="mt-3 text-sm">
                      <button
                        className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium underline"
                        onClick={() => {
                          // Apply this recommendation to all zones
                          alert('This would update all zone schedules with the recommended water amount. Implementation pending.');
                        }}
                      >
                        Apply to all zones
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Zone Controls */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Irrigation Zones</h2>
          <button
            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md p-1.5"
          >
            <Settings className="h-5 w-5 mr-1.5" />
            <span className="text-sm font-medium">Configure Zones</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {zones.map(zone => (
            <IrrigationZoneCard 
              key={zone.id}
              zone={zone}
              onToggle={handleToggleAutomation}
            />
          ))}
        </div>
      </div>
      
      {/* Schedule Viewer */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Irrigation Schedule</h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Zone</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Next Scheduled</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Duration</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Crops</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {zones.map(zone => {
                  const zoneCrops = crops.filter(crop => zone.cropIds.includes(crop.id));
                  
                  return (
                    <tr key={zone.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900 dark:text-white">{zone.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {zone.nextScheduled ? (
                          <div className="text-gray-600 dark:text-gray-300">
                            {new Date(zone.nextScheduled).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        ) : (
                          <div className="text-gray-500 dark:text-gray-400 italic">Not scheduled</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-600 dark:text-gray-300">{zone.duration} minutes</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {zoneCrops.length > 0 ? (
                            zoneCrops.map(crop => (
                              <span key={crop.id} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-300">
                                {crop.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400 italic">None assigned</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${
                          zone.status === 'active' 
                            ? 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-300' 
                            : zone.status === 'scheduled' 
                              ? 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-300' 
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {zone.status.charAt(0).toUpperCase() + zone.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Irrigation;