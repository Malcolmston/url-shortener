import { useEffect, useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark, faEye, faEyeSlash, faPen, faTrash,
  faRotateLeft, faDownload, faSearch, faTableCells, faList,
  faArrowsRotate, faFile, faPlus, faLock, faLockOpen
} from "@fortawesome/free-solid-svg-icons";
import Mime from "./Mime";
import AppShell from "./components/layout/AppShell";

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function FileSkeleton({ view }) {
  if (view === "grid") return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden animate-pulse">
      <div className="h-36 bg-gray-100 dark:bg-slate-800" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-3/4" />
        <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded w-1/2" />
      </div>
    </div>
  );
  return (
    <div className="flex items-center gap-4 p-4 border-b border-gray-100 dark:border-slate-800 animate-pulse">
      <div className="w-10 h-10 bg-gray-100 dark:bg-slate-800 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/3" />
        <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded w-1/5" />
      </div>
      <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded w-20" />
    </div>
  );
}

function ActionBtn({ icon, label, onClick, color = "violet" }) {
  const colors = {
    violet: "hover:bg-violet-100 dark:hover:bg-violet-950/40 hover:text-violet-600 dark:hover:text-violet-400",
    blue: "hover:bg-blue-100 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400",
    red: "hover:bg-red-100 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400",
    emerald: "hover:bg-emerald-100 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-400",
    white: "bg-white/20 hover:bg-white/30 text-white",
  };
  return (
    <button onClick={onClick} className={["p-1.5 rounded-lg text-gray-400 dark:text-slate-500 transition-colors", colors[color]].join(" ")} aria-label={label} title={label}>
      <FontAwesomeIcon icon={icon} className="w-3.5 h-3.5" />
    </button>
  );
}

function FileListRow({ file, onAction }) {
  const deleted = !!file.deletedAt;
  return (
    <div className={["flex items-center gap-4 px-4 py-3 group border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors", deleted ? "opacity-60" : ""].join(" ")}>
      <div className={["w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-xl", deleted ? "bg-gray-100 dark:bg-slate-800" : "bg-violet-50 dark:bg-violet-950/40"].join(" ")}>
        <Mime type={file.type} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">{file.name}</p>
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{formatDate(file.createdAt)}</p>
      </div>
      <span className={["hidden sm:flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full", file.visibility ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"].join(" ")}>
        <FontAwesomeIcon icon={file.visibility ? faLockOpen : faLock} className="text-[10px]" />
        {file.visibility ? "Public" : "Private"}
      </span>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
        {!deleted ? (
          <>
            <ActionBtn icon={file.visibility ? faEyeSlash : faEye} label={file.visibility ? "Make private" : "Make public"} onClick={() => onAction(file.id, "visibility", { visibility: file.visibility ? "0" : "1" })} color="violet" />
            <ActionBtn icon={faPen} label="Rename" onClick={() => onAction(file.id, "_edit")} color="blue" />
            <a href={`/uploads/${file.name}`} download={file.name} className="p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors" aria-label="Download">
              <FontAwesomeIcon icon={faDownload} className="w-3.5 h-3.5" />
            </a>
            <ActionBtn icon={faTrash} label="Delete" onClick={() => onAction(file.id, "delete")} color="red" />
          </>
        ) : (
          <ActionBtn icon={faRotateLeft} label="Restore" onClick={() => onAction(file.id, "recover")} color="emerald" />
        )}
      </div>
    </div>
  );
}

function FileGridCard({ file, onAction }) {
  const deleted = !!file.deletedAt;
  return (
    <div className={["group relative bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-md transition-all duration-200", deleted ? "opacity-60" : ""].join(" ")}>
      <div className="relative h-36 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center text-4xl">
        <Mime type={file.type} />
        {!deleted ? (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <ActionBtn icon={file.visibility ? faEyeSlash : faEye} label="Toggle visibility" onClick={() => onAction(file.id, "visibility", { visibility: file.visibility ? "0" : "1" })} color="white" />
            <ActionBtn icon={faPen} label="Rename" onClick={() => onAction(file.id, "_edit")} color="white" />
            <a href={`/uploads/${file.name}`} download={file.name} className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors" aria-label="Download">
              <FontAwesomeIcon icon={faDownload} className="w-3.5 h-3.5" />
            </a>
            <ActionBtn icon={faTrash} label="Delete" onClick={() => onAction(file.id, "delete")} color="white" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <ActionBtn icon={faRotateLeft} label="Restore" onClick={() => onAction(file.id, "recover")} color="white" />
          </div>
        )}
        <span className={["absolute top-2 right-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full", file.visibility ? "bg-emerald-500/80 text-white" : "bg-amber-500/80 text-white"].join(" ")}>
          {file.visibility ? "Public" : "Private"}
        </span>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">{file.name}</p>
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{formatDate(file.createdAt)}</p>
      </div>
    </div>
  );
}

function RenameModal({ file, onSave, onCancel }) {
  const [name, setName] = useState(file.name);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Rename file</h3>
        <input
          autoFocus type="text" value={name} onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") onSave(file.id, name.trim()); if (e.key === "Escape") onCancel(); }}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
          placeholder="filename.ext"
        />
        <div className="flex justify-end gap-3 mt-5">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">Cancel</button>
          <button onClick={() => onSave(file.id, name.trim())} className="px-4 py-2 text-sm font-medium bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors">Save</button>
        </div>
      </div>
    </div>
  );
}

const TABS = ["All", "Public", "Private", "Deleted"];

export default function Files() {
  const [isLoading, setIsLoading] = useState(true);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [view, setView] = useState("list");
  const [renamingFile, setRenamingFile] = useState(null);

  const fetchFiles = useCallback(async () => {
    try {
      setIsLoading(true); setError(null);
      const res = await fetch("/files");
      const data = await res.json();
      if (res.ok) setFiles(data.files);
      else setError(data.message || "Failed to fetch files");
    } catch { setError("Network error — please try again"); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const handleAction = useCallback(async (fileId, actionType, payload = {}) => {
    if (actionType === "_edit") { const f = files.find((f) => f.id === fileId); if (f) setRenamingFile(f); return; }
    try {
      const res = await fetch(`/action/${actionType}/${fileId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (res.ok && data.ok) await fetchFiles();
      else setError(data.message || `Failed to ${actionType} file`);
    } catch { setError("Network error — please try again"); }
  }, [files, fetchFiles]);

  const handleRename = async (fileId, newName) => { if (!newName) return; await handleAction(fileId, "name", { name: newName }); setRenamingFile(null); };

  const visibleFiles = files.filter((f) => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase());
    const matchTab = activeTab === "All" ? true : activeTab === "Public" ? f.visibility && !f.deletedAt : activeTab === "Private" ? !f.visibility && !f.deletedAt : !!f.deletedAt;
    return matchSearch && matchTab;
  });

  const counts = { All: files.length, Public: files.filter((f) => f.visibility && !f.deletedAt).length, Private: files.filter((f) => !f.visibility && !f.deletedAt).length, Deleted: files.filter((f) => !!f.deletedAt).length };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">My Files</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{files.length} file{files.length !== 1 ? "s" : ""} stored</p>
          </div>
          <a href="/upload" className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors">
            <FontAwesomeIcon icon={faPlus} /> Upload files
          </a>
        </div>

        {error && (
          <div className="flex items-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl text-sm text-red-700 dark:text-red-400">
            <FontAwesomeIcon icon={faXmark} className="flex-shrink-0" />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError(null)} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors"><FontAwesomeIcon icon={faXmark} /></button>
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100 dark:border-slate-800 overflow-x-auto">
            {TABS.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={["flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors", activeTab === tab ? "border-violet-600 text-violet-600 dark:text-violet-400" : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"].join(" ")}>
                {tab}
                <span className={["text-xs px-1.5 py-0.5 rounded-full font-medium", activeTab === tab ? "bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400" : "bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-500"].join(" ")}>{counts[tab]}</span>
              </button>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-3 p-3 border-b border-gray-100 dark:border-slate-800">
            <div className="relative flex-1 max-w-xs">
              <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 text-xs pointer-events-none" />
              <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search files…" className="w-full pl-9 pr-3 h-8 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm text-gray-700 dark:text-slate-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-colors" />
            </div>
            <div className="ml-auto flex items-center gap-1 border border-gray-200 dark:border-slate-700 rounded-lg p-0.5">
              {[{ v: "list", icon: faList }, { v: "grid", icon: faTableCells }].map(({ v, icon }) => (
                <button key={v} onClick={() => setView(v)} className={["p-1.5 rounded-md transition-colors", view === v ? "bg-violet-600 text-white" : "text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-200"].join(" ")} aria-label={`${v} view`}>
                  <FontAwesomeIcon icon={icon} className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
            <button onClick={fetchFiles} className="p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-violet-600 transition-colors" aria-label="Refresh">
              <FontAwesomeIcon icon={faArrowsRotate} className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* File list/grid */}
          {isLoading ? (
            view === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-4">{[...Array(8)].map((_, i) => <FileSkeleton key={i} view="grid" />)}</div>
            ) : (
              <div>{[...Array(6)].map((_, i) => <FileSkeleton key={i} view="list" />)}</div>
            )
          ) : visibleFiles.length === 0 ? (
            <div className="py-16 flex flex-col items-center text-center gap-3">
              <FontAwesomeIcon icon={faFile} className="text-4xl text-gray-200 dark:text-slate-700" />
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">{search ? `No files match "${search}"` : `No ${activeTab.toLowerCase()} files`}</p>
              {!search && activeTab === "All" && (
                <a href="/upload" className="mt-2 px-4 py-2 text-sm bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors">Upload your first file</a>
              )}
            </div>
          ) : view === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
              {visibleFiles.map((file) => <FileGridCard key={file.id} file={file} onAction={handleAction} />)}
            </div>
          ) : (
            <div>{visibleFiles.map((file) => <FileListRow key={file.id} file={file} onAction={handleAction} />)}</div>
          )}
        </div>
      </div>

      {renamingFile && <RenameModal file={renamingFile} onSave={handleRename} onCancel={() => setRenamingFile(null)} />}
    </AppShell>
  );
}
