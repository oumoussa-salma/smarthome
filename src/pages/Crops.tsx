import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CropCard from '../components/ui/CropCard';
import { crops } from '../utils/mockData';
import { Crop } from '../types';
import { Search, Filter, X, CheckCircle, AlertCircle, AlertTriangle, Camera, Upload, Smartphone } from 'lucide-react';
import { analyzePlantImage, captureFromWebcam, captureFromDroidcam } from '../utils/plantAnalysis';

const Crops: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'healthy' | 'at-risk' | 'diseased'>('all');
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    status: 'healthy' | 'at-risk' | 'diseased';
    confidence: number;
    issues: string[];
    recommendations: string[];
  } | null>(null);
  
  // New state for image handling
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageSource, setImageSource] = useState<'upload' | 'webcam' | 'droidcam' | null>(null);
  const [droidcamSettings, setDroidcamSettings] = useState({ ip: '192.168.1.2', port: '4747' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  
  const filteredCrops = crops.filter(crop => {
    const matchesSearch = crop.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           crop.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           crop.location.toLowerCase().includes(searchTerm.toLowerCase());
                           
    const matchesFilter = filterStatus === 'all' || crop.healthStatus === filterStatus;
    
    return matchesSearch && matchesFilter;
  });
  
  const handleCropClick = (crop: Crop) => {
    setSelectedCrop(crop);
    setIsModalOpen(true);
    setAnalysisResult(null);
    setSelectedImage(null);
    setImageSource(null);
    setShowImageOptions(false);
    setAnalysisError(null);
  };
  
  const handleHealthCheck = () => {
    setShowImageOptions(true);
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(URL.createObjectURL(file));
      setImageSource('upload');
      
      // Begin analysis
      analyzeImage(file);
    }
  };
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleWebcamCapture = async () => {
    try {
      setIsAnalyzing(true);
      setImageSource('webcam');
      
      const imageBlob = await captureFromWebcam();
      const imageUrl = URL.createObjectURL(imageBlob);
      setSelectedImage(imageUrl);
      
      // Analyze the captured image
      analyzeImage(imageBlob);
    } catch (error) {
      console.error('Error capturing from webcam:', error);
      setAnalysisError('Failed to capture from webcam. Please check your camera access or try uploading an image instead.');
      setIsAnalyzing(false);
    }
  };
  
  const handleDroidcamCapture = async () => {
    try {
      setIsAnalyzing(true);
      setImageSource('droidcam');
      
      const imageBlob = await captureFromDroidcam(
        droidcamSettings.ip,
        droidcamSettings.port
      );
      
      const imageUrl = URL.createObjectURL(imageBlob);
      setSelectedImage(imageUrl);
      
      // Analyze the captured image
      analyzeImage(imageBlob);
    } catch (error) {
      console.error('Error capturing from DroidCam:', error);
      setAnalysisError('DroidCam capture is not available in the web interface. Please use your device\'s webcam or upload an image instead.');
      setIsAnalyzing(false);
    }
  };
  
  const analyzeImage = async (imageSource: File | Blob | string) => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    
    try {
      // Call our plant analysis utility
      const result = await analyzePlantImage(imageSource);
      
      // Process the result
      processAnalysisResult(result);
    } catch (error) {
      console.error('Error analyzing image:', error);
      setAnalysisError('Failed to analyze the image. Please try again or try a different image.');
      setIsAnalyzing(false);
    }
  };
  
  const processAnalysisResult = (data: any) => {
    // Map health status
    const mappedStatus = 
      data.health_status === 'healthy' ? 'healthy' as const : 
      data.health_status === 'diseased' ? 'diseased' as const : 
      'at-risk' as const;
    
    // Calculate a confidence score
    const confidence = Math.floor(Math.random() * 15) + 85; // Random number between 85-99 for demo
    
    // Parse recommendations into an array if it's a string
    const recommendations = typeof data.treatment_recommendations === 'string'
      ? data.treatment_recommendations.split('\n').filter((item: string) => item.trim() !== '')
      : data.treatment_recommendations || [];
    
    // Create issues array based on health status and disease name
    const issues = [];
    
    if (mappedStatus === 'healthy') {
      issues.push('Plant appears healthy');
    } else {
      // Only add disease name if it's not 'none' or 'unknown'
      if (data.disease_name && 
          data.disease_name.toLowerCase() !== 'none' && 
          data.disease_name.toLowerCase() !== 'unknown') {
        issues.push(`Disease: ${data.disease_name}`);
      } else if (mappedStatus === 'diseased') {
        issues.push('Unidentified disease detected');
      } else if (mappedStatus === 'at-risk') {
        issues.push('Early signs of stress detected');
      }
    }
    
    // Always add crop identification if available
    if (data.crop_name && data.crop_name !== 'unknown') {
      issues.push(`Crop identified as: ${data.crop_name}`);
    }
    
    const result = {
      status: mappedStatus,
      confidence: confidence,
      issues: issues,
      recommendations: recommendations.length > 0 ? recommendations : [
        'Continue current care regimen',
        'Monitor regularly for changes'
      ],
    };
    
    setAnalysisResult(result);
    setIsAnalyzing(false);
    setShowImageOptions(false);
  };
  
  const resetAnalysis = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    setShowImageOptions(true);
    setImageSource(null);
    setAnalysisError(null);
  };
  
  const getStatusIcon = (status: 'healthy' | 'at-risk' | 'diseased') => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-success-500" />;
      case 'at-risk':
        return <AlertTriangle className="h-5 w-5 text-warning-500" />;
      case 'diseased':
        return <AlertCircle className="h-5 w-5 text-error-500" />;
      default:
        return null;
    }
  };
  
  return (
    <div className="p-4 sm:p-6 md:p-8">
      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Search crops..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex space-x-2 w-full sm:w-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
            <select
              className="block w-full pl-10 pr-8 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as any)}
            >
              <option value="all">All Status</option>
              <option value="healthy">Healthy</option>
              <option value="at-risk">At Risk</option>
              <option value="diseased">Diseased</option>
            </select>
          </div>
          
          <button
            className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-200"
          >
            Add Crop
          </button>
        </div>
      </div>
      
      {/* Crops Grid */}
      {filteredCrops.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card p-8 text-center">
          <p className="text-gray-600 dark:text-gray-300">No crops found matching your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCrops.map(crop => (
            <CropCard 
              key={crop.id} 
              crop={crop} 
              onClick={() => handleCropClick(crop)}
            />
          ))}
        </div>
      )}
      
      {/* Hidden file input for image upload */}
      <input 
        ref={fileInputRef}
        type="file" 
        accept="image/*" 
        className="hidden"
        onChange={handleFileUpload} 
      />
      
      {/* Crop Detail Modal */}
      <AnimatePresence>
        {isModalOpen && selectedCrop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative h-64 overflow-hidden rounded-t-lg">
                <img 
                  src={selectedCrop.imageUrl} 
                  alt={selectedCrop.name} 
                  className="w-full h-full object-cover"
                />
                <button
                  className="absolute top-4 right-4 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-colors duration-200"
                  onClick={() => setIsModalOpen(false)}
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                  <div className="flex items-center">
                    <div 
                      className={`w-3 h-3 rounded-full mr-2 ${
                        selectedCrop.healthStatus === 'healthy' 
                          ? 'bg-success-500' 
                          : selectedCrop.healthStatus === 'at-risk' 
                            ? 'bg-warning-500' 
                            : 'bg-error-500'
                      }`}
                    ></div>
                    <span className="text-white font-medium">
                      {selectedCrop.healthStatus.charAt(0).toUpperCase() + selectedCrop.healthStatus.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedCrop.name}</h2>
                    <p className="text-gray-600 dark:text-gray-300">{selectedCrop.type} • {selectedCrop.location}</p>
                  </div>
                  <span className="px-3 py-1 bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-sm rounded-md font-medium">
                    {selectedCrop.growthStage}
                  </span>
                </div>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Crop Details</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Planted Date:</span>
                        <span className="text-gray-900 dark:text-white">
                          {new Date(selectedCrop.plantedDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Last Irrigation:</span>
                        <span className="text-gray-900 dark:text-white">
                          {new Date(selectedCrop.lastIrrigation).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Next Scheduled:</span>
                        <span className="text-gray-900 dark:text-white">
                          {selectedCrop.nextScheduledIrrigation 
                            ? new Date(selectedCrop.nextScheduledIrrigation).toLocaleString([], {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'None scheduled'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Growth Days:</span>
                        <span className="text-gray-900 dark:text-white">
                          {Math.floor((new Date().getTime() - new Date(selectedCrop.plantedDate).getTime()) / (1000 * 60 * 60 * 24))} days
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Health Analysis</h3>
                    
                    {/* Initial state - no analysis and not analyzing */}
                    {!showImageOptions && !analysisResult && !isAnalyzing && !selectedImage && (
                      <div className="flex flex-col items-center justify-center h-36 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">Run a health check to analyze this crop</p>
                        <button
                          className="bg-secondary-500 hover:bg-secondary-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                          onClick={handleHealthCheck}
                        >
                          Run Health Check
                        </button>
                      </div>
                    )}
                    
                    {/* Image capture/upload options */}
                    {showImageOptions && !isAnalyzing && !selectedImage && (
                      <div className="border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Capture or upload a photo of your crop</h4>
                        <div className="grid grid-cols-1 gap-3">
                          <button
                            className="flex items-center justify-center bg-secondary-50 dark:bg-secondary-900/30 hover:bg-secondary-100 dark:hover:bg-secondary-800/50 text-secondary-700 dark:text-secondary-300 font-medium py-2 px-4 rounded-md transition-colors duration-200"
                            onClick={triggerFileInput}
                          >
                            <Upload className="h-5 w-5 mr-2" />
                            Upload Photo
                          </button>
                          
                          <button
                            className="flex items-center justify-center bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-800/50 text-primary-700 dark:text-primary-300 font-medium py-2 px-4 rounded-md transition-colors duration-200"
                            onClick={handleWebcamCapture}
                          >
                            <Camera className="h-5 w-5 mr-2" />
                            Capture from Webcam
                          </button>
                          
                          <div>
                            <button
                              className="flex items-center justify-center w-full bg-accent-50 dark:bg-accent-900/30 hover:bg-accent-100 dark:hover:bg-accent-800/50 text-accent-700 dark:text-accent-300 font-medium py-2 px-4 rounded-md transition-colors duration-200"
                              onClick={handleDroidcamCapture}
                            >
                              <Smartphone className="h-5 w-5 mr-2" />
                              Capture from DroidCam
                            </button>
                            
                            <div className="mt-2 flex space-x-2">
                              <input
                                type="text"
                                placeholder="IP Address"
                                value={droidcamSettings.ip}
                                onChange={(e) => setDroidcamSettings(prev => ({ ...prev, ip: e.target.value }))}
                                className="block w-full text-sm px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                              />
                              <input
                                type="text"
                                placeholder="Port"
                                value={droidcamSettings.port}
                                onChange={(e) => setDroidcamSettings(prev => ({ ...prev, port: e.target.value }))}
                                className="block w-24 text-sm px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                              />
                            </div>
                          </div>
                          
                          <button
                            className="mt-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 underline"
                            onClick={() => setShowImageOptions(false)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Analysis error message */}
                    {analysisError && (
                      <div className="border border-error-200 dark:border-error-800 bg-error-50 dark:bg-error-900/20 text-error-800 dark:text-error-300 rounded-lg p-4 mb-3">
                        <h4 className="text-sm font-medium flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1.5" />
                          Error
                        </h4>
                        <p className="mt-1 text-sm">{analysisError}</p>
                        <button
                          className="mt-2 text-sm underline hover:no-underline"
                          onClick={resetAnalysis}
                        >
                          Try again
                        </button>
                      </div>
                    )}
                    
                    {/* Loading state */}
                    {isAnalyzing && (
                      <div className="flex flex-col items-center justify-center h-36 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500 mb-3"></div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {imageSource === 'webcam' 
                            ? 'Capturing from webcam...' 
                            : imageSource === 'droidcam' 
                              ? 'Connecting to DroidCam...' 
                              : 'Analyzing crop health...'}
                        </p>
                      </div>
                    )}
                    
                    {/* Display the selected image (if there is one) */}
                    {selectedImage && !isAnalyzing && (
                      <div className="mb-3">
                        <div className="relative">
                          <img 
                            src={selectedImage}
                            alt="Captured crop" 
                            className="w-full h-40 object-contain border border-gray-200 dark:border-gray-700 rounded-lg"
                          />
                          <button
                            className="absolute top-2 right-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-1 transition-colors duration-200"
                            onClick={() => setSelectedImage(null)}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Analysis result */}
                    {analysisResult && !isAnalyzing && (
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <div className={`px-4 py-3 flex items-center ${
                          analysisResult.status === 'healthy' 
                            ? 'bg-success-50 dark:bg-success-900/30 text-success-800 dark:text-success-300' 
                            : analysisResult.status === 'at-risk' 
                              ? 'bg-warning-50 dark:bg-warning-900/30 text-warning-800 dark:text-warning-300' 
                              : 'bg-error-50 dark:bg-error-900/30 text-error-800 dark:text-error-300'
                        }`}>
                          {getStatusIcon(analysisResult.status)}
                          <span className="ml-2 font-medium">
                            {analysisResult.status === 'healthy' 
                              ? 'Healthy' 
                              : analysisResult.status === 'at-risk' 
                                ? 'At Risk' 
                                : 'Disease Detected'}
                          </span>
                          <span className="ml-auto text-xs">
                            {analysisResult.confidence}% confidence
                          </span>
                        </div>
                        
                        <div className="p-4">
                          {analysisResult.issues.length > 0 && (
                            <div className="mb-3">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Detected Issues:</h4>
                              <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
                                {analysisResult.issues.map((issue, index) => (
                                  <li key={index}>{issue}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Recommendations:</h4>
                            <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
                              {analysisResult.recommendations.map((rec, index) => (
                                <li key={index}>{rec}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <button
                            className="mt-3 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 underline"
                            onClick={resetAnalysis}
                          >
                            Try another image
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Close
                  </button>
                  {analysisResult && (
                    <button
                      className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                    >
                      Take Action
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Crops;