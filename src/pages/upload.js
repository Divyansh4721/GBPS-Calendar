import React, { useState } from 'react';
import Papa from 'papaparse';
import { addCalendarData, deleteAllCalendarData } from './firebase';
import { Upload, Calendar, FileText, Check, AlertTriangle } from 'lucide-react';
import Header from '../components/header'
const Uploader = () => {
  const [csvData, setCsvData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setIsLoading(true);
    setError(null);
    setUploadSuccess(false);
    Papa.parse(file, {
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          setCsvData(results.data);
        } else {
          setError('No data found in the CSV file');
        }
        setIsLoading(false);
      },
      error: (error) => {
        setError(`Error parsing CSV: ${error.message}`);
        setIsLoading(false);
      }
    });
  };
  const handleUploadData = async () => {
    if (!csvData || csvData.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      await deleteAllCalendarData();
      for (let doc of csvData) {
        doc[0] = doc[0].split('-').reverse().join('');
        await addCalendarData(doc);
      }
      setUploadSuccess(true);
    } catch (err) {
      setError(`Error uploading data: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
      <Header />
      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-3 text-white">
                <h2 className="text-xl font-bold flex items-center">
                  <Upload className="h-5 w-5 mr-2" />
                  Upload Calendar Data
                </h2>
              </div>
              <div className="p-5 space-y-4">
                <div className="relative">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="w-full text-sm text-purple-700 
                      file:mr-3 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-medium
                      file:bg-gradient-to-r file:from-purple-500 file:to-pink-500
                      file:text-white
                      hover:file:bg-gradient-to-r hover:file:from-purple-600 hover:file:to-pink-600
                      cursor-pointer"
                  />
                </div>
                {csvData && csvData.length > 0 && (
                  <button
                    onClick={handleUploadData}
                    disabled={uploading}
                    className={`w-full rounded-lg py-3 px-4 text-white font-medium transition-all duration-300
                      ${uploading
                        ? 'bg-gradient-to-r from-purple-400 to-pink-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-pink-500 hover:shadow-md hover:from-purple-700 hover:to-pink-600'
                      }
                    `}
                  >
                    <div className="flex items-center justify-center">
                      {uploading ? (
                        <>
                          <div className="animate-spin mr-2 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Calendar className="h-5 w-5 mr-2" />
                          Upload Data to Server
                        </>
                      )}
                    </div>
                  </button>
                )}
              </div>
            </div>
            {uploadSuccess && (
              <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                <div className="p-5 bg-gradient-to-r from-green-50 to-emerald-50">
                  <div className="flex items-center">
                    <div className="min-w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white shadow-md">
                      <Check size={24} />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-green-800">Upload Successful</h3>
                      <p className="text-green-600">
                        Your calendar data has been successfully uploaded to the server.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                <div className="p-5 bg-gradient-to-r from-red-50 to-orange-50">
                  <div className="flex items-center">
                    <div className="min-w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white shadow-md">
                      <AlertTriangle size={24} />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-red-800">Error</h3>
                      <p className="text-red-600">{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="md:col-span-2">
            {isLoading ? (
              <div className="flex justify-center items-center min-h-64 bg-white rounded-xl shadow-xl p-8">
                <div className="text-xl text-purple-600 animate-pulse flex flex-col items-center">
                  <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  Processing CSV file...
                </div>
              </div>
            ) : uploading ? (
              <div className="flex justify-center items-center min-h-64 bg-white rounded-xl shadow-xl p-8">
                <div className="text-xl text-purple-600 animate-pulse flex flex-col items-center">
                  <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  Uploading data to server...
                </div>
              </div>
            ) : csvData && csvData.length > 0 ? (
              <div className="bg-white rounded-xl shadow-xl p-8 text-center">
                <div className="text-purple-500 mb-4">
                  <FileText size={64} className="mx-auto" />
                </div>
                <p className="text-xl text-purple-800 font-medium">
                  CSV File Ready
                </p>
                <p className="text-gray-600 mt-2">
                  File contains {csvData.length} records
                </p>
                <p className="text-purple-600 mt-4 font-medium">
                  Click "Upload Data to Server" to continue
                </p>
              </div>
            ) : !isLoading && !error ? (
              <div className="bg-white rounded-xl shadow-xl p-8 text-center">
                <div className="text-purple-300 mb-4">
                  <FileText size={64} className="mx-auto" />
                </div>
                <p className="text-xl text-purple-800 font-medium">
                  No CSV data loaded
                </p>
                <p className="text-gray-500 mt-2">
                  Upload a CSV file to manage calendar data
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Uploader;