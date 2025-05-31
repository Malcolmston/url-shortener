import {useEffect, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faSpinner,
    faXmark,
    faEye,
    faEyeSlash,
    faEdit,
    faTrash,
    faTrashUndo,
    faDownload,
    faCalendar,
    faFile,
    faRefresh
} from "@fortawesome/pro-regular-svg-icons";
import Mime from "./Mime";

export default function Files() {
    const [isLoading, setIsLoading] = useState(true);
    const [files, setFiles] = useState([]);
    const [error, setError] = useState(null);
    const [editingFile, setEditingFile] = useState(null);
    const [editName, setEditName] = useState("");
    const [previewFile, setPreviewFile] = useState(null);
    const [modalShaking, setModalShaking] = useState(false);

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch("/files");
            const data = await response.json();

            if (response.ok) {
                setFiles(data.files);
            } else {
                setError(data.message || "Failed to fetch files");
            }
        } catch (err) {
            setError("An error occurred while fetching your files");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileAction = async (fileId, actionType, payload = {}) => {
        try {
            setError(null);
            const response = await fetch(`/action/${actionType}/${fileId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok && data.ok) {
                await fetchFiles();
                setEditingFile(null);
                setEditName("");
                console.log(data.message);
            } else {
                setError(data.message || `Failed to ${actionType} file`);
            }
        } catch (err) {
            setError(`An error occurred while trying to ${actionType} the file`);
            console.error(err);
        }
    };

    const toggleVisibility = (file) => {
        const newVisibility = file.visibility ? "0" : "1";
        handleFileAction(file.id, "visibility", { visibility: newVisibility });
    };

    const startEdit = (file) => {
        setEditingFile(file.id);
        setEditName(file.name);
    };

    const saveEdit = (fileId) => {
        // Remove client-side validation - let server handle it
        handleFileAction(fileId, "name", { name: editName.trim() });
    };

    const cancelEdit = () => {
        setEditingFile(null);
        setEditName("");
        setError(null);
    };

    const deleteFile = (fileId) => {
        if (window.confirm("Are you sure you want to delete this file?")) {
            handleFileAction(fileId, "delete");
        }
    };

    const restoreFile = (fileId) => {
        handleFileAction(fileId, "recover");
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const getFileExtension = (filename) => {
        return filename ? filename.split('.').pop() : '';
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return 'Unknown size';
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    };

    // Simple file URL - backend handles all authentication/validation
    const getFileUrl = (fileName) => {
        return `/uploads/${fileName}`;
    };

    const openPreview = (file) => {
        file.url = getFileUrl(file.name);
        setPreviewFile(file);
    };

    const closePreview = () => {
        setPreviewFile(null);
        setModalShaking(false);
    };

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

    const getMimeType = (filename) => {
        const mimeTypes = {
            // Images
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.svg': 'image/svg+xml',
            '.bmp': 'image/bmp',
            '.ico': 'image/x-icon',
            '.tiff': 'image/tiff',
            '.tif': 'image/tiff',
            '.heic': 'image/heic',
            '.heif': 'image/heif',
            '.avif': 'image/avif',
            '.jfif': 'image/jpeg',
            '.pjpeg': 'image/pjpeg',
            '.pjp': 'image/pjp',
            '.apng': 'image/apng',

            // Documents
            '.pdf': 'application/pdf',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.xls': 'application/vnd.ms-excel',
            '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            '.ppt': 'application/vnd.ms-powerpoint',
            '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            '.odt': 'application/vnd.oasis.opendocument.text',
            '.ods': 'application/vnd.oasis.opendocument.spreadsheet',
            '.odp': 'application/vnd.oasis.opendocument.presentation',
            '.odg': 'application/vnd.oasis.opendocument.graphics',
            '.odf': 'application/vnd.oasis.opendocument.formula',
            '.rtf': 'application/rtf',
            '.pages': 'application/vnd.apple.pages',
            '.numbers': 'application/vnd.apple.numbers',
            '.keynote': 'application/vnd.apple.keynote',

            // Text & Code
            '.txt': 'text/plain',
            '.html': 'text/html',
            '.htm': 'text/html',
            '.css': 'text/css',
            '.js': 'text/javascript',
            '.mjs': 'text/javascript',
            '.jsx': 'text/jsx',
            '.tsx': 'text/tsx',
            '.json': 'application/json',
            '.xml': 'text/xml',
            '.csv': 'text/csv',
            '.md': 'text/markdown',
            '.markdown': 'text/markdown',
            '.yaml': 'text/yaml',
            '.yml': 'text/yaml',
            '.toml': 'text/toml',
            '.ini': 'text/plain',
            '.cfg': 'text/plain',
            '.conf': 'text/plain',
            '.log': 'text/plain',
            '.sql': 'text/plain',
            '.sh': 'text/x-shellscript',
            '.bash': 'text/x-shellscript',
            '.zsh': 'text/x-shellscript',
            '.fish': 'text/x-shellscript',
            '.py': 'text/x-python',
            '.php': 'text/x-php',
            '.rb': 'text/x-ruby',
            '.go': 'text/x-go',
            '.java': 'text/x-java-source',
            '.c': 'text/x-c',
            '.cpp': 'text/x-c++',
            '.cc': 'text/x-c++',
            '.cxx': 'text/x-c++',
            '.h': 'text/x-c',
            '.hpp': 'text/x-c++',
            '.cs': 'text/x-csharp',
            '.vb': 'text/x-vb',
            '.swift': 'text/x-swift',
            '.kt': 'text/x-kotlin',
            '.rs': 'text/x-rust',
            '.dart': 'text/x-dart',
            '.scala': 'text/x-scala',
            '.clj': 'text/x-clojure',
            '.hs': 'text/x-haskell',
            '.elm': 'text/x-elm',
            '.r': 'text/x-r',
            '.m': 'text/x-objective-c',
            '.mm': 'text/x-objective-c++',
            '.pl': 'text/x-perl',
            '.lua': 'text/x-lua',

            // Audio
            '.mp3': 'audio/mpeg',
            '.wav': 'audio/wav',
            '.ogg': 'audio/ogg',
            '.oga': 'audio/ogg',
            '.m4a': 'audio/mp4',
            '.aac': 'audio/aac',
            '.flac': 'audio/flac',
            '.wma': 'audio/x-ms-wma',
            '.aiff': 'audio/aiff',
            '.aif': 'audio/aiff',
            '.au': 'audio/basic',
            '.snd': 'audio/basic',
            '.mid': 'audio/midi',
            '.midi': 'audio/midi',
            '.opus': 'audio/opus',
            '.amr': 'audio/amr',
            '.awb': 'audio/amr-wb',

            // Video
            '.mp4': 'video/mp4',
            '.avi': 'video/x-msvideo',
            '.mov': 'video/quicktime',
            '.wmv': 'video/x-ms-wmv',
            '.webm': 'video/webm',
            '.mkv': 'video/x-matroska',
            '.flv': 'video/x-flv',
            '.ogv': 'video/ogg',
            '.3gp': 'video/3gpp',
            '.3g2': 'video/3gpp2',
            '.mpg': 'video/mpeg',
            '.mpeg': 'video/mpeg',
            '.m4v': 'video/x-m4v',
            '.asf': 'video/x-ms-asf',
            '.rm': 'video/vnd.rn-realvideo',
            '.rmvb': 'video/vnd.rn-realvideo',
            '.vob': 'video/x-ms-vob',
            '.ts': 'video/mp2t',
            '.mts': 'video/mp2t',
            '.m2ts': 'video/mp2t',

            // Archives & Compressed
            '.zip': 'application/zip',
            '.rar': 'application/x-rar-compressed',
            '.tar': 'application/x-tar',
            '.gz': 'application/gzip',
            '.bz2': 'application/x-bzip2',
            '.xz': 'application/x-xz',
            '.7z': 'application/x-7z-compressed',
            '.cab': 'application/vnd.ms-cab-compressed',
            '.dmg': 'application/x-apple-diskimage',
            '.iso': 'application/x-iso9660-image',
            '.lzh': 'application/x-lzh-compressed',
            '.sit': 'application/x-stuffit',
            '.sitx': 'application/x-stuffitx',

            // Fonts
            '.ttf': 'font/ttf',
            '.otf': 'font/otf',
            '.woff': 'font/woff',
            '.woff2': 'font/woff2',
            '.eot': 'application/vnd.ms-fontobject',

            // Data & Configuration
            '.jsonl': 'application/jsonlines',
            '.ndjson': 'application/x-ndjson',
            '.geojson': 'application/geo+json',
            '.kml': 'application/vnd.google-earth.kml+xml',
            '.kmz': 'application/vnd.google-earth.kmz',
            '.gpx': 'application/gpx+xml',
            '.rss': 'application/rss+xml',
            '.atom': 'application/atom+xml',
            '.vcf': 'text/vcard',
            '.vcard': 'text/vcard',
            '.ics': 'text/calendar',
            '.ical': 'text/calendar',

            // Adobe & Design
            '.psd': 'image/vnd.adobe.photoshop',
            '.ai': 'application/postscript',
            '.eps': 'application/postscript',
            '.ps': 'application/postscript',
            '.indd': 'application/x-indesign',
            '.sketch': 'application/x-sketch',

            // CAD & 3D
            '.dwg': 'image/vnd.dwg',
            '.dxf': 'image/vnd.dxf',
            '.step': 'application/step',
            '.stp': 'application/step',
            '.iges': 'application/iges',
            '.igs': 'application/iges',
            '.obj': 'application/x-tgif',
            '.stl': 'application/sla',
            '.ply': 'application/polygon',
            '.3ds': 'application/x-3ds',
            '.blend': 'application/x-blender',

            // Database
            '.db': 'application/x-sqlite3',
            '.sqlite': 'application/x-sqlite3',
            '.sqlite3': 'application/x-sqlite3',
            '.mdb': 'application/x-msaccess',
            '.accdb': 'application/x-msaccess',

            // Executable & Binary
            '.exe': 'application/x-msdownload',
            '.msi': 'application/x-msdownload',
            '.app': 'application/x-executable',
            '.deb': 'application/vnd.debian.binary-package',
            '.rpm': 'application/x-rpm',
            '.pkg': 'application/x-newton-compatible-pkg',
            '.apk': 'application/vnd.android.package-archive',
            '.ipa': 'application/x-ios-app',

            // Web & Network
            '.manifest': 'text/cache-manifest',
            '.appcache': 'text/cache-manifest',
            '.webapp': 'application/x-web-app-manifest+json',
            '.crx': 'application/x-chrome-extension',
            '.xpi': 'application/x-xpinstall',

            // Scientific & Math
            '.mat': 'application/x-matlab-data',
            '.fig': 'application/x-matlab-figure',
            '.nb': 'application/mathematica',
            '.cdf': 'application/vnd.wolfram.cdf',

            // Game & Interactive
            '.swf': 'application/x-shockwave-flash',
            '.fla': 'application/x-flash-project',
            '.unity3d': 'application/vnd.unity',
            '.sbsar': 'application/x-substance-archive',

            // Backup & Disk Images
            '.bak': 'application/x-backup',
            '.img': 'application/x-raw-disk-image',
            '.vmdk': 'application/x-vmware-disk',
            '.vdi': 'application/x-virtualbox-disk',
            '.qcow2': 'application/x-qemu-disk',

            // Legacy & Specialized
            '.wps': 'application/vnd.ms-works',
            '.wpd': 'application/vnd.wordperfect',
            '.one': 'application/onenote',
            '.pub': 'application/x-mspublisher',
            '.vsd': 'application/vnd.visio',
            '.vsdx': 'application/vnd.visio2013',
            '.mpp': 'application/vnd.ms-project',
            '.msg': 'application/vnd.ms-outlook',
            '.eml': 'message/rfc822',

            // eBooks
            '.epub': 'application/epub+zip',
            '.mobi': 'application/x-mobipocket-ebook',
            '.azw': 'application/vnd.amazon.ebook',
            '.azw3': 'application/vnd.amazon.ebook',
            '.fb2': 'application/x-fictionbook+xml',
            '.lit': 'application/x-ms-reader',

            // Security & Certificates
            '.p12': 'application/x-pkcs12',
            '.pfx': 'application/x-pkcs12',
            '.p7b': 'application/x-pkcs7-certificates',
            '.p7c': 'application/x-pkcs7-mime',
            '.der': 'application/x-x509-ca-cert',
            '.crt': 'application/x-x509-ca-cert',
            '.cer': 'application/x-x509-ca-cert',
            '.pem': 'application/x-pem-file',
            '.key': 'application/x-pem-file',

            // Torrent & P2P
            '.torrent': 'application/x-bittorrent',
            '.magnet': 'application/x-magnet',

            // Virtual Reality & 3D Web
            '.gltf': 'model/gltf+json',
            '.glb': 'model/gltf-binary',
            '.usd': 'model/vnd.usdz+zip',
            '.usdz': 'model/vnd.usdz+zip',

            // Blockchain & Crypto
            '.sol': 'text/x-solidity',
            '.vy': 'text/x-vyper'
        };

        const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
        return mimeTypes[ext] || 'application/octet-stream';
    };

    const renderPreview = (file) => {
        const fileUrl = getFileUrl(file.name);
        const mimeType = getMimeType(file.name);

        if (mimeType.startsWith('image/')) {
            return (
                <img
                    src={fileUrl}
                    alt={file.name}
                    className="max-w-full max-h-96 object-contain rounded-lg mx-auto"
                    onError={(e) => {
                        console.error('Image load error for file:', file.name);
                        e.target.style.display = 'none';
                        e.target.parentNode.innerHTML = `
                            <div class="flex items-center justify-center h-48 bg-red-50 rounded-lg border border-red-200">
                                <div class="text-center">
                                    <div class="text-red-500 mb-2">⚠️</div>
                                    <p class="text-red-600">Failed to load image</p>
                                    <p class="text-red-500 text-sm mt-1">File may be private or deleted</p>
                                </div>
                            </div>
                        `;
                    }}
                />
            );
        } else if (mimeType.startsWith('video/')) {
            return (
                <video controls className="max-w-full max-h-96 rounded-lg mx-auto">
                    <source src={fileUrl} type={mimeType} />
                    Your browser does not support the video tag.
                </video>
            );
        } else if (mimeType.startsWith('audio/')) {
            return (
                <div className="flex justify-center">
                    <audio controls className="w-full max-w-md">
                        <source src={fileUrl} type={mimeType} />
                        Your browser does not support the audio tag.
                    </audio>
                </div>
            );
        } else if (mimeType === 'application/pdf') {
            return (
                <div className="space-y-4">
                    <iframe
                        src={fileUrl}
                        className="w-full h-96 rounded-lg border border-gray-200"
                        title={`PDF Preview - ${file.name}`}
                        onError={() => console.error('PDF load error for file:', file.name)}
                    />
                    <div className="flex justify-center">
                        <a
                            href={fileUrl}
                            download={file.name}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        >
                            Download PDF
                        </a>
                    </div>
                </div>
            );
        } else if (mimeType.startsWith('text/') || mimeType === 'application/json') {
            return (
                <div className="bg-gray-100 p-4 rounded-lg max-h-96 overflow-auto">
                    <p className="text-sm text-gray-600 mb-2">Text file preview:</p>
                    <div className="bg-white p-4 rounded border">
                        <TextFilePreview fileUrl={fileUrl} fileName={file.name} />
                    </div>
                </div>
            );
        } else {
            return (
                <div className="space-y-4">
                    <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg">
                        <div className="text-center">
                            <Mime
                                mime={mimeType}
                                extension={getFileExtension(file.name)}
                                size="3x"
                                className="mb-4"
                            />
                            <p className="text-gray-500 mb-2">Preview not available for this file type</p>
                            <p className="text-sm text-gray-400">{mimeType || 'Unknown type'}</p>
                        </div>
                    </div>
                    <div className="flex justify-center">
                        <a
                            href={fileUrl}
                            download={file.name}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        >
                            Download File
                        </a>
                    </div>
                </div>
            );
        }
    };

    // Simple text file preview component - backend handles auth
    const TextFilePreview = ({ fileUrl, fileName }) => {
        const [textContent, setTextContent] = useState('Loading...');

        useEffect(() => {
            fetch(fileUrl)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    return response.text();
                })
                .then(text => setTextContent(text))
                .catch(err => {
                    console.error('Text file load error:', err);
                    setTextContent(`Error loading file: ${err.message}`);
                });
        }, [fileUrl]);

        return (
            <pre className="text-sm font-mono whitespace-pre-wrap max-h-64 overflow-auto">
                {textContent}
            </pre>
        );
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-center py-12">
                    <FontAwesomeIcon icon={faSpinner} className="text-blue-500 animate-spin mr-3" size="lg" />
                    <span className="text-gray-600">Loading your files...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <FontAwesomeIcon icon={faXmark} className="text-red-500 mr-2" />
                        <span className="text-red-700">Error: {error}</span>
                    </div>
                    <button
                        onClick={fetchFiles}
                        className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">My Files</h1>
                    <p className="text-gray-600">Manage your uploaded files</p>
                </div>
                <button
                    onClick={fetchFiles}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                    <FontAwesomeIcon icon={faRefresh} className="mr-2" />
                    Refresh
                </button>
            </div>

            {/* Files Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center">
                        <FontAwesomeIcon icon={faFile} className="text-blue-600 mr-3" size="lg" />
                        <div>
                            <p className="text-2xl font-bold text-gray-800">{files.length}</p>
                            <p className="text-sm text-gray-600">Total Files</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center">
                        <FontAwesomeIcon icon={faEye} className="text-green-600 mr-3" size="lg" />
                        <div>
                            <p className="text-2xl font-bold text-gray-800">
                                {files.filter(f => f.visibility && !f.deletedAt).length}
                            </p>
                            <p className="text-sm text-gray-600">Public Files</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center">
                        <FontAwesomeIcon icon={faEyeSlash} className="text-gray-600 mr-3" size="lg" />
                        <div>
                            <p className="text-2xl font-bold text-gray-800">
                                {files.filter(f => !f.visibility && !f.deletedAt).length}
                            </p>
                            <p className="text-sm text-gray-600">Private Files</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center">
                        <FontAwesomeIcon icon={faTrash} className="text-red-600 mr-3" size="lg" />
                        <div>
                            <p className="text-2xl font-bold text-gray-800">
                                {files.filter(f => f.deletedAt).length}
                            </p>
                            <p className="text-sm text-gray-600">Deleted Files</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Files List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">Files</h2>
                </div>

                {files.length === 0 ? (
                    <div className="p-12 text-center">
                        <FontAwesomeIcon icon={faFile} className="text-gray-300 mb-4" size="3x" />
                        <h3 className="text-lg font-medium text-gray-600 mb-2">No files uploaded yet</h3>
                        <p className="text-gray-500">Upload your first file to get started</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {files.map((file) => (
                            <div key={file.id} className={`p-6 hover:bg-gray-50 transition-colors duration-200 ${file.deletedAt ? 'opacity-60' : ''}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4 flex-1">
                                        <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200">
                                            <Mime
                                                mime={getMimeType(file.name)}
                                                extension={getFileExtension(file.name)}
                                                size="lg"
                                            />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            {editingFile === file.id ? (
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="text"
                                                        value={editName}
                                                        onChange={(e) => setEditName(e.target.value)}
                                                        className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') saveEdit(file.id);
                                                            if (e.key === 'Escape') cancelEdit();
                                                        }}
                                                        placeholder="Enter file name"
                                                        autoFocus
                                                    />
                                                    <button
                                                        onClick={() => saveEdit(file.id)}
                                                        className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={cancelEdit}
                                                        className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-800 truncate mb-1">
                                                        {file.name}
                                                    </h3>
                                                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                        <span className="flex items-center">
                                                            <FontAwesomeIcon icon={faCalendar} className="mr-1" />
                                                            {formatDate(file.createdAt)}
                                                        </span>
                                                        {file.file && (
                                                            <span>{formatFileSize(file.file.length)}</span>
                                                        )}
                                                        <span className="text-gray-400">{getMimeType(file.name)}</span>
                                                        {file.deletedAt && (
                                                            <span className="text-red-500 font-medium">
                                                                Deleted {formatDate(file.deletedAt)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                file.visibility
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                <FontAwesomeIcon
                                                    icon={file.visibility ? faEye : faEyeSlash}
                                                    className="mr-1"
                                                />
                                                {file.visibility ? 'Public' : 'Private'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center space-x-1 ml-4">
                                        {!file.deletedAt ? (
                                            <>
                                                {/* Preview */}
                                                <button
                                                    onClick={() => openPreview(file)}
                                                    className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200"
                                                    title="Preview File"
                                                >
                                                    <FontAwesomeIcon icon={faEye} />
                                                </button>

                                                {/* Download */}
                                                <a
                                                    href={getFileUrl(file.name)}
                                                    download={file.name}
                                                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                                    title="Download"
                                                >
                                                    <FontAwesomeIcon icon={faDownload} />
                                                </a>

                                                {/* Toggle visibility */}
                                                <button
                                                    onClick={() => toggleVisibility(file)}
                                                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                                                    title={file.visibility ? "Make Private" : "Make Public"}
                                                >
                                                    <FontAwesomeIcon icon={file.visibility ? faEyeSlash : faEye} />
                                                </button>

                                                {/* Edit name */}
                                                <button
                                                    onClick={() => startEdit(file)}
                                                    className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors duration-200"
                                                    title="Edit Name"
                                                >
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </button>

                                                {/* Delete */}
                                                <button
                                                    onClick={() => deleteFile(file.id)}
                                                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                                    title="Delete"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </>
                                        ) : (
                                            /* Restore button for deleted files */
                                            <button
                                                onClick={() => restoreFile(file.id)}
                                                className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                                                title="Restore File"
                                            >
                                                <FontAwesomeIcon icon={faTrashUndo} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
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
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                    <Mime
                                        mime={getMimeType(previewFile.name)}
                                        extension={getFileExtension(previewFile.name)}
                                        className="mr-2"
                                    />
                                    {previewFile.name}
                                </h3>
                                <div className="text-sm text-gray-500 mt-1 flex items-center space-x-4">
                                    <span>Size: {formatFileSize(previewFile.file ? previewFile.file.length : 0)}</span>
                                    <span>•</span>
                                    <span>Type: {getMimeType(previewFile.name)}</span>
                                    <span>•</span>
                                    <span>Created: {formatDate(previewFile.createdAt)}</span>
                                    <span>•</span>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                        previewFile.visibility
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        <FontAwesomeIcon
                                            icon={previewFile.visibility ? faEye : faEyeSlash}
                                            className="mr-1"
                                        />
                                        {previewFile.visibility ? 'Public' : 'Private'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <a
                                    href={previewFile.url || getFileUrl(previewFile.name)}
                                    download={previewFile.name}
                                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                    title="Download"
                                >
                                    <FontAwesomeIcon icon={faDownload} />
                                </a>
                                <button
                                    onClick={closePreview}
                                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                                    title="Close preview"
                                >
                                    <FontAwesomeIcon icon={faXmark} size="lg" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            {renderPreview(previewFile)}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
