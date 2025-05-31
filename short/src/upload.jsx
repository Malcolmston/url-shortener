import {useEffect, useState} from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faCloudArrowUp, faFile, faCircleCheck, faXmark, faEye, faUserCircle, faSpinner} from "@fortawesome/pro-regular-svg-icons";

export default function Upload () {
    const [isDragOver, setIsDragOver] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [previewFile, setPreviewFile] = useState(null);
    const [modalShaking, setModalShaking] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [showErrorToast, setShowErrorToast] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        let timeoutId;

        if (showSuccessToast || showErrorToast) {
            timeoutId = setTimeout(() => {
                setShowSuccessToast(false);
                setShowErrorToast(false);
            }, 4000);
        }

        return () => clearTimeout(timeoutId);
    }, [showSuccessToast, showErrorToast]);

    const dropHandler = (event) => {
        event.preventDefault();
        setIsDragOver(false);

        if(event.dataTransfer.items) {
            [...event.dataTransfer.items].forEach(async (item, i) => {
                if(item.kind === "file") {
                    let file = item.getAsFile();
                    const reader = new FileReader();
                    reader.onload = () => {
                        const newFile = {
                            id: Date.now() + i,
                            name: file.name,
                            size: file.size,
                            type: file.type,
                            url: reader.result
                        };
                        setUploadedFiles(prev => [...prev, newFile]);
                    };
                    reader.readAsDataURL(file);
                    console.log(`… file[${i}].name = ${file.name}`);
                }
            });
        } else {
            [...event.dataTransfer.files].forEach(async (file, i) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const newFile = {
                        id: Date.now() + i,
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        url: reader.result
                    };
                    setUploadedFiles(prev => [...prev, newFile]);
                };
                reader.readAsDataURL(file);
                console.log(`… file[${i}].name = ${file.name}`);
            });
        }
    }

    const dragOverHandler = (event) => {
        event.preventDefault();
        setIsDragOver(true);
    }

    const dragLeaveHandler = (event) => {
        event.preventDefault();
        setIsDragOver(false);
    }

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    const removeFile = (id) => {
        setUploadedFiles(prev => prev.filter(file => file.id !== id));
    }

    const openPreview = (file) => {
        setPreviewFile(file);
    }

    const closePreview = () => {
        setPreviewFile(null);
        setModalShaking(false);
    }

    const handleModalClick = (e) => {
        if (e.target === e.currentTarget) {
            // Trigger shake animation
            setModalShaking(true);

            // Remove shake class after animation completes
            setTimeout(() => {
                setModalShaking(false);
            }, 1000); // animate.css headShake duration is typically 1s
        }
    };

    const renderPreview = (file) => {
        if (file.type.startsWith('image/')) {
            return <img src={file.url} alt={file.name} className="max-w-full max-h-96 object-contain rounded-lg" />;
        } else if (file.type.startsWith('video/')) {
            return (
                <video controls className="max-w-full max-h-96 rounded-lg">
                    <source src={file.url} type={file.type} />
                    Your browser does not support the video tag.
                </video>
            );
        } else if (file.type.startsWith('audio/')) {
            return (
                <audio controls className="w-full">
                    <source src={file.url} type={file.type} />
                    Your browser does not support the audio tag.
                </audio>
            );
        } else if (file.type === 'application/pdf') {
            return (
                <div className="space-y-4">
                    <iframe
                        src={file.url}
                        className="w-full h-96 rounded-lg border border-gray-200"
                        title={`PDF Preview - ${file.name}`}
                    />
                    <div className="flex justify-center">
                        <a
                            href={file.url}
                            download={file.name}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        >
                            Download PDF
                        </a>
                    </div>
                </div>
            );
        } else if (file.type.startsWith('text/')) {
            return (
                <div className="bg-gray-100 p-4 rounded-lg max-h-96 overflow-auto">
                    <p className="text-sm text-gray-600 mb-2">Text file preview:</p>
                    <div className="bg-white p-4 rounded border">
                        <p className="text-sm font-mono whitespace-pre-wrap">Loading text content...</p>
                    </div>
                </div>
            );
        } else {
            return (
                <div className="space-y-4">
                    <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg">
                        <div className="text-center">
                            <FontAwesomeIcon icon={faFile} className="text-gray-400 mb-4" size="3x" />
                            <p className="text-gray-500 mb-2">Preview not available for this file type</p>
                            <p className="text-sm text-gray-400">{file.type || 'Unknown type'}</p>
                        </div>
                    </div>
                    <div className="flex justify-center">
                        <a
                            href={file.url}
                            download={file.name}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        >
                            Download File
                        </a>
                    </div>
                </div>
            );
        }
    }

    const handleFileInputChange = (event) => {
        [...event.target.files].forEach((file, i) => {
            const reader = new FileReader();
            reader.onload = () => {
                const newFile = {
                    id: Date.now() + i,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    url: reader.result
                };
                setUploadedFiles(prev => [...prev, newFile]);
            };
            reader.readAsDataURL(file);
        });
        // Reset the input value so the same file can be selected again
        event.target.value = '';
    }

    const handleDropZoneClick = () => {
        document.getElementById('fileInput').click();
    }

    const handleSubmit = async () => {
        setIsUploading(true);
        setUploadProgress(0);

        const formData = new FormData();

        // Simulate progress during file preparation
        for (let i = 0; i < uploadedFiles.length; i++) {
            const file = uploadedFiles[i];
            const response = await fetch(file.url);
            const blob = await response.blob();
            const realFile = new File([blob], file.name, { type: file.type });
            formData.append("files", realFile);

            // Update progress during file preparation (0-30%)
            setUploadProgress(Math.round((i + 1) / uploadedFiles.length * 30));
        }

        try {
            // Create XMLHttpRequest for progress tracking
            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    // Upload progress (30-100%)
                    const uploadPercent = Math.round((e.loaded / e.total) * 70);
                    setUploadProgress(30 + uploadPercent);
                }
            });

            const uploadPromise = new Promise((resolve, reject) => {
                xhr.onreadystatechange = () => {
                    if (xhr.readyState === XMLHttpRequest.DONE) {
                        if (xhr.status === 200) {
                            try {
                                const response = JSON.parse(xhr.responseText);
                                resolve(response);
                            } catch (e) {
                                reject(new Error('Invalid JSON response'));
                            }
                        } else {
                            reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
                        }
                    }
                };

                xhr.onerror = () => reject(new Error('Network error'));
                xhr.open('POST', '/upload');
                xhr.send(formData);
            });

            const response = await uploadPromise;
            setUploadProgress(100);

            if (response.ok) {
                setSuccessMessage("Files uploaded successfully!");
                setShowSuccessToast(true);
                setUploadedFiles([]);
            } else {
                setErrorMessage(response.message || "Upload failed.");
                setShowErrorToast(true);
            }
        } catch (e) {
            console.error(e);
            setErrorMessage("An unexpected error occurred.");
            setShowErrorToast(true);
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    }


    return (
        <>

            {/* Error Toast */}
            {showErrorToast && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md shadow-sm relative animate__animated animate__fadeInDown">
                    <button
                        className="absolute top-1 right-1 text-red-500 hover:text-red-700"
                        onClick={() => setShowErrorToast(false)}
                    >
                        ×
                    </button>
                    <p>{errorMessage}</p>
                </div>
            )}

            {/* Success Toast */}
            {showSuccessToast && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md shadow-sm relative animate__animated animate__fadeInDown">
                    <button
                        className="absolute top-1 right-1 text-green-500 hover:text-green-700"
                        onClick={() => setShowSuccessToast(false)}
                    >
                        ×
                    </button>
                    <p>{successMessage}</p>
                </div>
            )}

            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">File Upload Dashboard</h1>
                    <p className="text-gray-600">Drag and drop your files to get started</p>
                </div>

                <div className="space-y-6">
                    {/* Hidden file input */}
                    <input
                        id="fileInput"
                        type="file"
                        multiple
                        onChange={handleFileInputChange}
                        className="hidden"
                        accept="*/*"
                    />

                    <div
                        id="drop_zone"
                        onDrop={dropHandler}
                        onDragOver={dragOverHandler}
                        onDragLeave={dragLeaveHandler}
                        onClick={handleDropZoneClick}
                        className={`
                            relative border-2 border-dashed rounded-xl p-12 text-center
                            transition-all duration-300 ease-in-out transform
                            ${isDragOver
                            ? 'border-blue-400 bg-blue-50 scale-105 shadow-lg'
                            : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
                        }
                            cursor-pointer group
                        `}
                    >
                        <div className={`
                            transition-all duration-300 ease-in-out
                            ${isDragOver ? 'scale-110' : 'group-hover:scale-105'}
                        `}>
                            <FontAwesomeIcon
                                icon={faCloudArrowUp}
                                className={`
                                    mx-auto mb-4 transition-colors duration-300
                                    ${isDragOver ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-600'}
                                `}
                                size="3x"
                            />
                            <p className={`
                                text-lg font-medium mb-2 transition-colors duration-300
                                ${isDragOver ? 'text-blue-600' : 'text-gray-700'}
                            `}>
                                {isDragOver ? 'Drop files here!' : 'Drag files to this drop zone'}
                            </p>
                            <p className="text-sm text-gray-500">
                                or click to browse files
                            </p>
                        </div>

                        {/* Animated background effect */}
                        <div className={`
                            absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300
                            ${isDragOver ? 'opacity-10' : ''}
                            bg-gradient-to-r from-blue-400 to-purple-500
                        `} />
                    </div>

                    {/* Upload Progress Bar */}
                    {isUploading && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                    <FontAwesomeIcon icon={faSpinner} className="text-blue-500 mr-2 animate-spin" />
                                    Uploading Files...
                                </h3>
                                <span className="text-sm font-medium text-gray-600">{uploadProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                            <div className="mt-2 text-sm text-gray-500">
                                {uploadProgress < 30 ? 'Preparing files...' :
                                    uploadProgress < 100 ? 'Uploading to server...' :
                                        'Processing completed!'}
                            </div>
                        </div>
                    )}

                    {/* Uploaded Files List */}
                    {uploadedFiles.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <FontAwesomeIcon icon={faCircleCheck} className="text-green-500 mr-2" />
                                Uploaded Files ({uploadedFiles.length})
                            </h3>
                            <div className="space-y-3">
                                {uploadedFiles.map((file, index) => (
                                    <div
                                        key={file.id}
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 animate-in slide-in-from-bottom-2 duration-300"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <FontAwesomeIcon icon={faFile} className="text-blue-500" />
                                            <div>
                                                <p className="font-medium text-gray-800">{file.name}</p>
                                                <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                type="button"
                                                onClick={() => openPreview(file)}
                                                className="text-blue-500 hover:text-blue-700 transition-colors duration-200 px-2 py-1 rounded hover:bg-blue-50"
                                                title="Preview file"
                                                disabled={isUploading}
                                            >
                                                <FontAwesomeIcon icon={faEye} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => removeFile(file.id)}
                                                className="text-red-500 hover:text-red-700 transition-colors duration-200 px-2 py-1 rounded hover:bg-red-50"
                                                title="Remove file"
                                                disabled={isUploading}
                                            >
                                                <FontAwesomeIcon icon={faXmark} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {uploadedFiles.length > 0 && (
                        <div className="flex justify-center">
                            <button
                                disabled={uploadedFiles.length <= 0 || isUploading}
                                type="submit"
                                onClick={handleSubmit}
                                className={`
                                    px-8 py-3 rounded-lg font-medium transform transition-all duration-200 shadow-lg
                                    ${isUploading
                                    ? 'bg-gray-400 text-gray-300 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 hover:shadow-xl'
                                }
                                `}
                            >
                                {isUploading ? (
                                    <>
                                        <FontAwesomeIcon icon={faSpinner} className="mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    'Process Files'
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Preview Modal */}
            {previewFile && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                    onClick={handleModalClick}
                >
                    <div className={`bg-white rounded-xl max-w-4xl max-h-[90vh] w-full overflow-auto ${modalShaking ? 'animate__animated animate__headShake' : ''}`}>
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">{previewFile.name}</h3>
                                <div className="text-sm text-gray-500 mt-1">
                                    <span>Size: {formatFileSize(previewFile.size)}</span>
                                    <span className="mx-2">•</span>
                                    <span>Type: {previewFile.type || 'Unknown'}</span>
                                </div>
                            </div>
                            <button
                                onClick={closePreview}
                                className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-2 rounded hover:bg-gray-100"
                                title="Close preview"
                            >
                                <FontAwesomeIcon icon={faXmark} size="lg" />
                            </button>
                        </div>
                        <div className="p-6">
                            {renderPreview(previewFile)}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
