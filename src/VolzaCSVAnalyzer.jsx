import React, { useState, useRef } from 'react';
import { Upload, Download, Moon, Sun, BarChart3, FileText, TrendingUp, Users } from 'lucide-react';

const VolzaCSVAnalyzer = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const fileInputRef = useRef(null);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file && file.type === 'text/csv') {
    setUploadedFile(file);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result.split(',')[1]; // remove data URL prefix
      await uploadToLambda(base64, file.name);
    };
    reader.readAsDataURL(file); // reads file as base64-encoded string
  } else {
    alert('Please upload a valid CSV file');
  }
};


  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/csv') {
      setUploadedFile(file);
      await uploadToLambda(file);
    } else {
      alert('Please upload a valid CSV file');
    }
  };

const uploadToLambda = async (base64Data, fileName) => {
  try {
    const response = await fetch("https://6au9w43e09.execute-api.us-west-2.amazonaws.com/prod/process", {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: base64Data // RAW base64, no JSON
    });

    const result = await response.json();
    const parsed = JSON.parse(result.body); // ✅ Parse the inner JSON string

    if (response.ok) {
      console.log("Processed file URL:", parsed.download_url);
      setDownloadUrl(parsed.download_url);
      alert(`Download ready: ${parsed.download_url}`);
    } else {
      alert("Error from server: " + parsed.error);
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    alert("Something went wrong while uploading.");
  }
};



  const themeClasses = isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900';
  const cardClasses = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${themeClasses}`}>
      {/* Header */}
      <header className={`${cardClasses} border-b`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold">Volza Automation</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 border rounded-lg"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-gray-600" />}
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Upload CSV for Analysis</h1>
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Let AWS Lambda handle the analysis. Get a processed file in seconds.
          </p>
        </div>

        {/* Upload Box */}
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`${cardClasses} border-2 border-dashed rounded-2xl p-12 text-center mb-8`}
        >
          <Upload className={`mx-auto h-16 w-16 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          <h3 className="text-xl font-semibold mb-2">Drag and drop your CSV file here</h3>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-6`}>Or click to browse</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
          >
            Upload CSV
          </button>
        </div>

        {/* Loading */}
        {isAnalyzing && (
          <div className={`${cardClasses} rounded-xl p-8 mb-8 text-center`}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg font-medium">Analyzing your file with Lambda...</p>
          </div>
        )}

        {/* Download Result */}
        {downloadUrl && !isAnalyzing && (
          <div className={`${cardClasses} rounded-xl border-2 border-green-500 p-8 text-center shadow-lg`}>
            <div className="bg-green-100 dark:bg-green-900 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <Download className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-green-600">✅ Analysis Complete!</h3>
            <a
              href={downloadUrl}
              download
              className="bg-green-600 hover:bg-green-700 text-white px-10 py-4 rounded-xl font-semibold inline-flex items-center space-x-3 text-lg shadow-lg"
            >
              <Download className="h-6 w-6" />
              <span>Download Processed CSV</span>
            </a>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm mt-4`}>
              File: analyzed_{uploadedFile?.name}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default VolzaCSVAnalyzer;
