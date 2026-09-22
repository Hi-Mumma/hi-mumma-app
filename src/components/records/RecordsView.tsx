import React, { useState } from 'react';
import { MedicalRecordItem, RecordFolderType, PregnancyPhase } from '../../types';

interface RecordsViewProps {
  records: MedicalRecordItem[];
  selectedFolder: RecordFolderType;
  onSelectFolder: (folder: RecordFolderType) => void;
  onUploadRecord: (name: string, fileType: 'pdf' | 'camera' | 'gallery', folder: RecordFolderType) => void;
  phase: PregnancyPhase;
  onBackToHome: () => void;
}

export const RecordsView: React.FC<RecordsViewProps> = ({
  records,
  selectedFolder,
  onSelectFolder,
  onUploadRecord,
  phase,
  onBackToHome
}) => {
  const [previewItem, setPreviewItem] = useState<MedicalRecordItem | null>(null);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [customFileName, setCustomFileName] = useState<string>('');
  const [uploadType, setUploadType] = useState<'pdf' | 'camera' | 'gallery'>('pdf');

  const folders: { id: RecordFolderType; label: string; range: string; icon: string; phaseTag: string }[] = [
    { id: 'first_trimester', label: 'First Trimester', range: 'Weeks 1–12', icon: '📁', phaseTag: 'Antenatal Phase 1' },
    { id: 'second_trimester', label: 'Second Trimester', range: 'Weeks 13–27', icon: '📁', phaseTag: 'Antenatal Phase 2' },
    { id: 'third_trimester', label: 'Third Trimester', range: 'Weeks 28–40+', icon: '📁', phaseTag: 'Antenatal Phase 3' },
    {
      id: 'postpartum',
      label: 'Postpartum Vault',
      range: 'Days 1–42 Post-Delivery',
      icon: '🌸',
      phaseTag: 'Post-Delivery Phase'
    }
  ];

  const currentFolderRecords = records.filter((r) => r.folder === selectedFolder);

  const handleOpenUploadWithType = (type: 'pdf' | 'camera' | 'gallery') => {
    setUploadType(type);
    setShowUploadModal(true);
  };

  const handleCreateMockUpload = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = customFileName.trim() || `Clinical_Report_${Date.now().toString().slice(-4)}.${uploadType === 'pdf' ? 'pdf' : 'jpg'}`;
    onUploadRecord(finalName, uploadType, selectedFolder);
    setCustomFileName('');
    setShowUploadModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Bar with Return button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-1.5 text-xs font-bold text-[#5A677D] hover:text-[#192231] transition-colors"
        >
          ← Return to Dashboard
        </button>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8F9EB3]">
          Maternal Digital Vault
        </span>
      </div>

      {/* Header Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-tr from-[#FDF5F8] via-white to-[#F0F6FD] border border-[#E8EFF7] shadow-xs">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🗂️</span>
              <h2 className="text-base font-black text-[#192231]">My Health Records</h2>
            </div>
            <p className="text-[11px] text-[#5A677D] mt-1">
              Organized chronological repository for scans, blood panels, and clinical documents.
            </p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-3.5 py-2 rounded-2xl bg-[#192231] text-white text-xs font-bold shadow-xs hover:bg-[#2b3952] active:scale-95 transition-all flex items-center gap-1.5"
          >
            <span>+</span>
            <span>Upload</span>
          </button>
        </div>
      </div>

      {/* Folder Tabs */}
      <div className="grid grid-cols-2 gap-2.5">
        {folders.map((f) => {
          const isSelected = selectedFolder === f.id;
          const count = records.filter((r) => r.folder === f.id).length;
          return (
            <button
              key={f.id}
              onClick={() => onSelectFolder(f.id)}
              className={`p-3.5 rounded-3xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-br from-[#FFF5F8] via-white to-[#F0F7FF] border-[#6FAFED] shadow-md ring-2 ring-[#EA81AA]/30'
                  : 'bg-white border-[#E8EFF7] hover:border-[#6FAFED]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xl">{f.icon}</span>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-white border border-[#E2ECF7] text-[#192231] shadow-xs">
                  {count} {count === 1 ? 'file' : 'files'}
                </span>
              </div>
              <h4 className="text-xs font-black text-[#192231] truncate">{f.label}</h4>
              <p className="text-[9px] text-[#7A8B9E]">{f.range}</p>
              <span className="inline-block text-[8px] font-bold text-[#6FAFED] mt-1 bg-[#F0F7FF] px-1.5 py-0.5 rounded">
                {f.phaseTag}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Folder Document List & Direct Upload Controls */}
      <div className="p-5 rounded-[32px] bg-white border border-[#E2ECF7] shadow-xs space-y-3.5">
        <div className="flex items-center justify-between border-b border-[#F0F4FA] pb-2.5">
          <div>
            <h4 className="text-xs font-black text-[#192231]">
              {folders.find((f) => f.id === selectedFolder)?.label}
            </h4>
            <p className="text-[10px] text-[#7A8B9E]">
              {currentFolderRecords.length} Documents Encrypted & Indexed
            </p>
          </div>

          <span className="text-[10px] font-bold text-[#EA81AA] bg-[#FDF2F7] px-2.5 py-1 rounded-full border border-[#FCE7F3]">
            {folders.find((f) => f.id === selectedFolder)?.range}
          </span>
        </div>

        {/* Direct Upload Shortcut Buttons: Camera, Gallery, PDF */}
        <div className="grid grid-cols-3 gap-2 p-2 bg-[#FAFBFD] rounded-2xl border border-[#EBF1F9]">
          <button
            onClick={() => handleOpenUploadWithType('camera')}
            className="flex flex-col items-center py-2 px-1 rounded-xl bg-white border border-[#E2ECF7] hover:border-[#EA81AA] text-[10px] font-bold text-[#192231] shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <span className="text-base mb-0.5">📷</span>
            <span>Camera</span>
          </button>
          <button
            onClick={() => handleOpenUploadWithType('gallery')}
            className="flex flex-col items-center py-2 px-1 rounded-xl bg-white border border-[#E2ECF7] hover:border-[#6FAFED] text-[10px] font-bold text-[#192231] shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <span className="text-base mb-0.5">🖼️</span>
            <span>Gallery</span>
          </button>
          <button
            onClick={() => handleOpenUploadWithType('pdf')}
            className="flex flex-col items-center py-2 px-1 rounded-xl bg-white border border-[#E2ECF7] hover:border-[#38BDF8] text-[10px] font-bold text-[#192231] shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <span className="text-base mb-0.5">📄</span>
            <span>PDF Upload</span>
          </button>
        </div>

        {currentFolderRecords.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <span className="text-3xl opacity-60">📄</span>
            <p className="text-xs font-bold text-[#5A677D]">This folder is empty</p>
            <p className="text-[10px] text-[#8F9EB3]">
              Tap "+ Upload" above to securely store mock ultrasound reports or blood test PDFs.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {currentFolderRecords.map((item) => (
              <div
                key={item.id}
                onClick={() => setPreviewItem(item)}
                className="p-3 rounded-2xl bg-[#FAFBFD] border border-[#EBF1F9] hover:border-[#6FAFED] transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-white border border-[#E2ECF7] flex items-center justify-center text-sm group-hover:scale-105 transition-transform">
                    {item.fileType === 'pdf' ? '📄' : item.fileType === 'camera' ? '📷' : '🖼️'}
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-[#192231] truncate max-w-[190px]">
                      {item.name}
                    </h5>
                    <p className="text-[10px] text-[#8F9EB3]">
                      {item.date} • {item.fileSize}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#6FAFED] group-hover:translate-x-0.5 transition-transform">
                    View →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Simulation Dialog Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 border border-[#E2ECF7] shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#F0F4FA] pb-2">
              <h3 className="text-sm font-black text-[#192231]">Store Medical Record</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-sm font-bold text-[#8F9EB3] hover:text-[#192231]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMockUpload} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-[#5A677D] block mb-1">
                  Upload Source
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'pdf', label: 'PDF Document', icon: '📄' },
                    { id: 'camera', label: 'Camera Scan', icon: '📷' },
                    { id: 'gallery', label: 'Photo Library', icon: '🖼️' }
                  ].map((s) => (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => setUploadType(s.id as any)}
                      className={`p-2.5 rounded-xl border text-center text-xs transition-all ${
                        uploadType === s.id
                          ? 'bg-[#F3F8FE] border-[#6FAFED] text-[#192231] font-bold shadow-xs'
                          : 'bg-[#FAFBFD] border-[#E8EFF7] text-[#5A677D]'
                      }`}
                    >
                      <span className="text-base block mb-0.5">{s.icon}</span>
                      <span className="text-[10px]">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#5A677D] block mb-1">
                  Document Title / Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Growth_Scan_Report_W28.pdf"
                  value={customFileName}
                  onChange={(e) => setCustomFileName(e.target.value)}
                  className="w-full bg-[#FAFBFD] border border-[#E2ECF7] rounded-xl py-2 px-3 text-xs text-[#192231] placeholder-[#A0B0C4] focus:outline-none focus:border-[#6FAFED]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#5A677D] block mb-1">
                  Assigned Folder
                </label>
                <div className="p-2.5 rounded-xl bg-[#F8FAFD] border border-[#E8EFF7] text-xs font-bold text-[#192231]">
                  {folders.find((f) => f.id === selectedFolder)?.label}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#EA81AA] to-[#6FAFED] text-white text-xs font-black shadow-sm active:scale-95 transition-all"
                >
                  Upload to Secure Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 border border-[#E2ECF7] shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#F0F4FA] pb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {previewItem.fileType === 'pdf' ? '📄' : '🖼️'}
                </span>
                <div>
                  <h4 className="text-xs font-black text-[#192231] truncate max-w-[200px]">
                    {previewItem.name}
                  </h4>
                  <p className="text-[10px] text-[#8F9EB3]">
                    {previewItem.date} • {previewItem.fileSize}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="text-sm font-bold text-[#8F9EB3] hover:text-[#192231]"
              >
                ✕
              </button>
            </div>

            {/* Simulated Medical Document Viewer */}
            <div className="h-64 rounded-2xl bg-[#F8FAFD] border border-[#E2ECF7] p-4 flex flex-col items-center justify-center text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-white border border-[#C7DFF9] flex items-center justify-center text-2xl shadow-xs">
                🏥
              </div>
              <p className="text-xs font-extrabold text-[#192231]">
                Document Secured in Personal Vault
              </p>
              <p className="text-[10px] text-[#5A677D] max-w-xs leading-relaxed">
                Stored for your review with your attending OB-GYN. All metadata indexed locally.
              </p>
              <div className="mt-2 px-3 py-1 rounded-full bg-white border border-[#E8EFF7] text-[10px] font-mono text-[#6FAFED]">
                Checksum: MD5-{previewItem.id}-SECURE
              </div>
            </div>

            <button
              onClick={() => setPreviewItem(null)}
              className="w-full py-2.5 rounded-xl bg-[#192231] text-white text-xs font-bold"
            >
              Close Document
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
