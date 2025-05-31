import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFile,
    faFileImage,
    faFileVideo,
    faFileAudio,
    faFileText,
    faFilePdf,
    faFileWord,
    faFileExcel,
    faFilePowerpoint,
    faFileArchive,
    faFileCode,
    faFileCsv,
    faFileLines
} from "@fortawesome/pro-regular-svg-icons";

export default function Mime({ mime, extension, className = "", size = "1x" }) {
    const getMimeIcon = (mimeType, ext) => {
        const mimeKey = mimeType?.toLowerCase() || '';
        const extKey = ext?.toLowerCase().replace('.', '') || '';

        switch (true) {
            // Images
            case mimeKey === 'image/jpeg':
            case mimeKey === 'image/jpg':
            case mimeKey === 'image/png':
            case mimeKey === 'image/gif':
            case mimeKey === 'image/webp':
            case mimeKey === 'image/svg+xml':
            case mimeKey === 'image/bmp':
            case mimeKey === 'image/tiff':
            case extKey === 'jpg':
            case extKey === 'jpeg':
            case extKey === 'png':
            case extKey === 'gif':
            case extKey === 'webp':
            case extKey === 'svg':
            case extKey === 'bmp':
            case extKey === 'tiff':
            case extKey === 'heic':
                return faFileImage;

            // Videos
            case mimeKey === 'video/mp4':
            case mimeKey === 'video/avi':
            case mimeKey === 'video/mov':
            case mimeKey === 'video/wmv':
            case mimeKey === 'video/flv':
            case mimeKey === 'video/webm':
            case mimeKey === 'video/mkv':
            case extKey === 'mp4':
            case extKey === 'avi':
            case extKey === 'mov':
            case extKey === 'wmv':
            case extKey === 'flv':
            case extKey === 'webm':
            case extKey === 'mkv':
                return faFileVideo;

            // Audio
            case mimeKey === 'audio/mp3':
            case mimeKey === 'audio/wav':
            case mimeKey === 'audio/flac':
            case mimeKey === 'audio/aac':
            case mimeKey === 'audio/ogg':
            case mimeKey === 'audio/wma':
            case mimeKey === 'audio/m4a':
            case extKey === 'mp3':
            case extKey === 'wav':
            case extKey === 'flac':
            case extKey === 'aac':
            case extKey === 'ogg':
            case extKey === 'wma':
            case extKey === 'm4a':
                return faFileAudio;

            // PDF
            case mimeKey === 'application/pdf':
            case extKey === 'pdf':
                return faFilePdf;

            // Microsoft Word
            case mimeKey === 'application/msword':
            case mimeKey === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            case extKey === 'doc':
            case extKey === 'docx':
                return faFileWord;

            // Microsoft Excel
            case mimeKey === 'application/vnd.ms-excel':
            case mimeKey === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
            case extKey === 'xls':
            case extKey === 'xlsx':
                return faFileExcel;

            // Microsoft PowerPoint
            case mimeKey === 'application/vnd.ms-powerpoint':
            case mimeKey === 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
            case extKey === 'ppt':
            case extKey === 'pptx':
                return faFilePowerpoint;

            // CSV
            case mimeKey === 'text/csv':
            case mimeKey === 'application/csv':
            case extKey === 'csv':
                return faFileCsv;

            // Plain Text
            case mimeKey === 'text/plain':
            case extKey === 'txt':
                return faFileText;

            // Code Files
            case mimeKey === 'text/javascript':
            case mimeKey === 'application/javascript':
            case mimeKey === 'text/html':
            case mimeKey === 'text/css':
            case mimeKey === 'application/json':
            case mimeKey === 'text/xml':
            case mimeKey === 'application/xml':
            case mimeKey === 'text/x-php':
            case mimeKey === 'application/x-php':
            case mimeKey === 'text/x-python':
            case mimeKey === 'application/x-python':
            case mimeKey === 'text/x-java-source':
            case mimeKey === 'text/x-c':
            case mimeKey === 'text/x-c++':
            case extKey === 'js':
            case extKey === 'ts':
            case extKey === 'jsx':
            case extKey === 'tsx':
            case extKey === 'html':
            case extKey === 'htm':
            case extKey === 'css':
            case extKey === 'scss':
            case extKey === 'sass':
            case extKey === 'less':
            case extKey === 'json':
            case extKey === 'xml':
            case extKey === 'php':
            case extKey === 'py':
            case extKey === 'java':
            case extKey === 'c':
            case extKey === 'cpp':
            case extKey === 'h':
            case extKey === 'hpp':
            case extKey === 'sql':
            case extKey === 'sh':
            case extKey === 'bash':
            case extKey === 'yml':
            case extKey === 'yaml':
                return faFileCode;

            // Structured Text
            case mimeKey === 'text/markdown':
            case mimeKey === 'text/x-markdown':
            case extKey === 'md':
            case extKey === 'markdown':
            case extKey === 'log':
            case extKey === 'ini':
            case extKey === 'conf':
            case extKey === 'cfg':
                return faFileLines;

            // Archives
            case mimeKey === 'application/zip':
            case mimeKey === 'application/x-rar-compressed':
            case mimeKey === 'application/x-tar':
            case mimeKey === 'application/gzip':
            case mimeKey === 'application/x-7z-compressed':
            case mimeKey === 'application/x-bzip2':
            case extKey === 'zip':
            case extKey === 'rar':
            case extKey === 'tar':
            case extKey === 'gz':
            case extKey === 'gzip':
            case extKey === '7z':
            case extKey === 'bz2':
            case extKey === 'bzip2':
                return faFileArchive;

            // Default
            default:
                return faFile;
        }
    };

    const getIconColor = (mimeType, ext) => {
        const mimeKey = mimeType?.toLowerCase() || '';
        const extKey = ext?.toLowerCase().replace('.', '') || '';

        switch (true) {
            // Images - Blue
            case mimeKey.startsWith('image/'):
            case ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff'].includes(extKey):
                return "text-blue-500";

            // Videos - Purple
            case mimeKey.startsWith('video/'):
            case ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'].includes(extKey):
                return "text-purple-500";

            // Audio - Green
            case mimeKey.startsWith('audio/'):
            case ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a'].includes(extKey):
                return "text-green-500";

            // PDF - Red
            case mimeKey === 'application/pdf':
            case extKey === 'pdf':
                return "text-red-500";

            // Microsoft Office - Orange
            case mimeKey.includes('msword'):
            case mimeKey.includes('wordprocessingml'):
            case mimeKey.includes('ms-excel'):
            case mimeKey.includes('spreadsheetml'):
            case mimeKey.includes('ms-powerpoint'):
            case mimeKey.includes('presentationml'):
            case ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extKey):
                return "text-orange-500";

            // CSV - Emerald
            case mimeKey.includes('csv'):
            case extKey === 'csv':
                return "text-emerald-500";

            // Code Files - Indigo
            case mimeKey.includes('javascript'):
            case mimeKey.includes('json'):
            case mimeKey.includes('html'):
            case mimeKey.includes('css'):
            case mimeKey.includes('php'):
            case mimeKey.includes('python'):
            case mimeKey.includes('java'):
            case mimeKey.includes('xml'):
            case ['js', 'ts', 'jsx', 'tsx', 'html', 'htm', 'css', 'scss', 'sass', 'less', 'json', 'xml', 'php', 'py', 'java', 'c', 'cpp', 'h', 'hpp', 'sql', 'sh', 'bash', 'yml', 'yaml'].includes(extKey):
                return "text-indigo-500";

            // Text/Markdown - Slate
            case mimeKey.startsWith('text/'):
            case ['txt', 'md', 'markdown', 'log', 'ini', 'conf', 'cfg'].includes(extKey):
                return "text-slate-500";

            // Archives - Yellow
            case mimeKey.includes('zip'):
            case mimeKey.includes('rar'):
            case mimeKey.includes('tar'):
            case mimeKey.includes('gzip'):
            case mimeKey.includes('7z'):
            case mimeKey.includes('bzip'):
            case ['zip', 'rar', 'tar', 'gz', 'gzip', '7z', 'bz2', 'bzip2'].includes(extKey):
                return "text-yellow-500";

            // Default - Gray
            default:
                return "text-gray-500";
        }
    };

    const icon = getMimeIcon(mime, extension);
    const colorClass = getIconColor(mime, extension);
    const combinedClassName = `${colorClass} ${className}`.trim();

    return (
        <FontAwesomeIcon
            icon={icon}
            className={combinedClassName}
            size={size}
            title={`${mime || 'Unknown'} ${extension ? `(.${extension.replace('.', '')})` : ''}`}
        />
    );
}
