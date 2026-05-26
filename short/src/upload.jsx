import { useState, useRef, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCloudArrowUp, faFile, faXmark, faCheck, faTriangleExclamation, faSpinner
} from "@fortawesome/free-solid-svg-icons";
import AppShell from "./components/layout/AppShell";

function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1048576) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1048576).toFixed(1)} MB`;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB per file
const ACCEPT = "*/*";

// ── File status item ──────────────────────────────────────────────────────

function FileItem({ item, onRemove }) {
  const statusIcon = {
    idle:       <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-slate-600 inline-block" />,
    uploading:  <FontAwesomeIcon icon={faSpinner} className="text-violet-500 animate-spin w-3.5" />,
    done:       <FontAwesomeIcon icon={faCheck} className="text-emerald-500 w-3.5" />,
    error:      <FontAwesomeIcon icon={faTriangleExclamation} className="text-red-500 w-3.5" />,
  };

  const barColor = {
    idle:      "bg-gray-200 dark:bg-slate-700",
    uploading: "bg-violet-500",
    done:      "bg-emerald-500",
    error:     "bg-red-500",
  };

  return (
    <div className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/50 group transition-colors">
      <div className="w-9 h-9 rounded-lg bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center flex-shrink-0 text-lg">
        <FontAwesomeIcon icon={faFile} className="text-violet-400 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">{item.file.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 h-1 rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${barColor[item.status]}`}
              style={{ width: `${item.progress}%` }}
            />
          </div>
          <span className="text-xs text-gray-400 dark:text-slate-500 tabular-nums w-8 text-right">
            {item.status === "done" ? "Done" : item.status === "error" ? "Error" : formatBytes(item.file.size)}
          </span>
        </div>
        {item.error && <p className="text-xs text-red-500 mt-0.5 truncate">{item.error}</p>}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {statusIcon[item.status]}
        {(item.status === "idle" || item.status === "error") && (
          <button
            onClick={() => onRemove(item.id)}
            className="p-1 rounded-md text-gray-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-500 transition-all"
            aria-label={`Remove ${item.file.name}`}
          >
            <FontAwesomeIcon icon={faXmark} className="w-3" />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Drop zone ─────────────────────────────────────────────────────────────

function DropZone({ onFiles, disabled }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length) onFiles(dropped);
  }, [onFiles, disabled]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={[
        "relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 py-14 px-8 text-center select-none",
        dragging
          ? "border-violet-500 bg-violet-50 dark:bg-violet-950/20 scale-[1.02]"
          : disabled
          ? "border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 cursor-not-allowed opacity-60"
          : "border-gray-300 dark:border-slate-700 hover:border-violet-400 dark:hover:border-violet-600 hover:bg-violet-50/50 dark:hover:bg-violet-950/10",
      ].join(" ")}
      role="button"
      aria-label="Drop files here or click to browse"
    >
      <div className={["w-16 h-16 rounded-2xl flex items-center justify-center transition-colors", dragging ? "bg-violet-500" : "bg-violet-100 dark:bg-violet-950/40"].join(" ")}>
        <FontAwesomeIcon
          icon={faCloudArrowUp}
          className={["text-3xl transition-colors", dragging ? "text-white" : "text-violet-500 dark:text-violet-400"].join(" ")}
        />
      </div>
      <div>
        <p className="text-base font-semibold text-gray-800 dark:text-slate-200">
          {dragging ? "Drop to add files" : "Drag & drop files here"}
        </p>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          or <span className="text-violet-600 dark:text-violet-400 font-medium">browse from your device</span>
        </p>
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">Any file type · Max 50 MB per file</p>
      </div>
      <input ref={inputRef} type="file" multiple accept={ACCEPT} className="sr-only" onChange={(e) => onFiles(Array.from(e.target.files))} disabled={disabled} />
    </div>
  );
}

// ── Main upload page ──────────────────────────────────────────────────────

let nextId = 0;

export default function Upload() {
  const [queue, setQueue] = useState([]);
  const [uploading, setUploading] = useState(false);

  const addFiles = useCallback((fileList) => {
    const newItems = fileList
      .filter((f) => f.size <= MAX_FILE_SIZE)
      .map((f) => ({ id: nextId++, file: f, status: "idle", progress: 0, error: null }));
    const oversized = fileList.filter((f) => f.size > MAX_FILE_SIZE);
    const oversizedItems = oversized.map((f) => ({
      id: nextId++, file: f, status: "error", progress: 0,
      error: `File too large (${formatBytes(f.size)}). Max is 50 MB.`,
    }));
    setQueue((prev) => [...prev, ...newItems, ...oversizedItems]);
  }, []);

  const removeItem = useCallback((id) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const uploadAll = async () => {
    const idle = queue.filter((item) => item.status === "idle");
    if (!idle.length) return;
    setUploading(true);

    for (const item of idle) {
      // Mark as uploading
      setQueue((prev) => prev.map((q) => q.id === item.id ? { ...q, status: "uploading", progress: 10 } : q));

      const form = new FormData();
      form.append("files", item.file);

      try {
        const res = await fetch("/upload", { method: "POST", body: form });

        // Simulate progress completion
        setQueue((prev) => prev.map((q) => q.id === item.id ? { ...q, progress: 90 } : q));

        const data = await res.json();
        if (res.ok && data.ok) {
          setQueue((prev) => prev.map((q) => q.id === item.id ? { ...q, status: "done", progress: 100 } : q));
        } else {
          setQueue((prev) => prev.map((q) => q.id === item.id ? { ...q, status: "error", progress: 0, error: data.message || "Upload failed" } : q));
        }
      } catch {
        setQueue((prev) => prev.map((q) => q.id === item.id ? { ...q, status: "error", progress: 0, error: "Network error" } : q));
      }
    }

    setUploading(false);
  };

  const clearDone = () => setQueue((prev) => prev.filter((q) => q.status !== "done"));
  const clearAll = () => setQueue([]);

  const idleCount = queue.filter((q) => q.status === "idle").length;
  const doneCount = queue.filter((q) => q.status === "done").length;
  const errorCount = queue.filter((q) => q.status === "error").length;
  const uploadingCount = queue.filter((q) => q.status === "uploading").length;

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Upload Files</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            Add files to your account. They'll be private by default.
          </p>
        </div>

        {/* Drop zone */}
        <DropZone onFiles={addFiles} disabled={uploading} />

        {/* Queue */}
        {queue.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden">
            {/* Queue header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-3 text-sm">
                <span className="font-medium text-gray-700 dark:text-slate-300">{queue.length} file{queue.length !== 1 ? "s" : ""}</span>
                {doneCount > 0 && <span className="text-xs px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-full">{doneCount} done</span>}
                {errorCount > 0 && <span className="text-xs px-1.5 py-0.5 bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 rounded-full">{errorCount} failed</span>}
                {uploadingCount > 0 && <span className="text-xs px-1.5 py-0.5 bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400 rounded-full">{uploadingCount} uploading</span>}
              </div>
              <div className="flex items-center gap-2">
                {doneCount > 0 && (
                  <button onClick={clearDone} className="text-xs text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors">
                    Clear done
                  </button>
                )}
                {!uploading && (
                  <button onClick={clearAll} className="text-xs text-gray-400 dark:text-slate-500 hover:text-red-500 transition-colors">
                    Clear all
                  </button>
                )}
              </div>
            </div>

            {/* File items */}
            <div className="divide-y divide-gray-50 dark:divide-slate-800 px-1">
              {queue.map((item) => (
                <FileItem key={item.id} item={item} onRemove={removeItem} />
              ))}
            </div>
          </div>
        )}

        {/* Upload button */}
        {idleCount > 0 && (
          <button
            onClick={uploadAll}
            disabled={uploading}
            className={[
              "w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200",
              uploading
                ? "bg-violet-400 text-white cursor-not-allowed"
                : "bg-violet-600 hover:bg-violet-700 text-white shadow-sm hover:shadow-md active:scale-[0.99]",
            ].join(" ")}
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                Uploading…
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <FontAwesomeIcon icon={faCloudArrowUp} />
                Upload {idleCount} file{idleCount !== 1 ? "s" : ""}
              </span>
            )}
          </button>
        )}

        {/* Success */}
        {doneCount > 0 && idleCount === 0 && !uploading && (
          <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-xl">
            <FontAwesomeIcon icon={faCheck} className="text-emerald-500 flex-shrink-0" />
            <p className="text-sm text-emerald-700 dark:text-emerald-400 flex-1">
              {doneCount} file{doneCount !== 1 ? "s" : ""} uploaded successfully.{" "}
              <a href="/files" className="font-medium underline hover:no-underline">View your files →</a>
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
