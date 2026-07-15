import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/logoblue.png";

function UploadDocument() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleSelectedFile = (selectedFile) => {
    if (!selectedFile) return;

    setFile(selectedFile);

    // PDF Preview
    if (selectedFile.type === "application/pdf") {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
    // Image Preview
    else if (selectedFile.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
    // DOC/DOCX
    else {
      setPreviewUrl("");
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    handleSelectedFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files[0];
    handleSelectedFile(droppedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const uploadFile = async () => {
    if (!file) {
      alert("Please select a document.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("document", file);

      const response = await axios.post(
        "https://draftonaut.onrender.com/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      localStorage.setItem("pdfText", response.data.extractedText || "");
      alert("Information Extracted Successfully");
      navigate("/review-data");
    } catch (error) {
      console.log(error);
      alert("Upload Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      /* STRICTLY locks the layout to exactly 100vh and completely hides scrollbars */
      className="h-screen w-screen overflow-hidden bg-white flex flex-col"
      style={{
        fontFamily: "Futura PT, Futura, sans-serif",
      }}
    >
      {/* 1. HEADER: Removed bottom padding (pb-1) to pull it closer to the content below */}
      <header className="shrink-0 w-full flex justify-center items-center pt-4 lg:pt-6 pb-1 z-20">
        <img
          src={logo}
          alt="Draftonaut"
          className="h-15 lg:h-15 object-contain cursor-pointer transition-transform hover:opacity-80"
          onClick={() => navigate("/")}
        />
      </header>

      {/* 2. MAIN CONTENT WRAPPER: Removed top padding (pt-1) to close the gap to the logo */}
      <main className="flex-1 min-h-0 w-full flex items-center justify-center px-4 lg:px-6 pt-1 pb-4 lg:pb-6 z-10">
        {/* INNER CONTAINER: Fills main height exactly, flex-col layout */}
        <div className="w-full max-w-5xl h-full flex flex-col">
          {/* HEADER TEXT: Reduced bottom margin to save vertical space */}
          <div className="shrink-0 text-center mb-3 lg:mb-5">
            <div className="inline-flex items-center justify-center px-4 py-1 mb-2 bg-blue-50 text-[#0269ff] text-[10px] font-bold uppercase tracking-widest">
              AI Powered Extraction
            </div>
            <h1 className="text-xl lg:text-3xl font-bold text-slate-800 tracking-tight">
              Upload Previous Agreement
            </h1>
            <p className="text-xs lg:text-sm text-slate-500 mt-1 max-w-xl mx-auto hidden sm:block">
              Provide your existing document, and our AI will automatically
              extract the necessary legal clauses and data.
            </p>
          </div>

          {/* ================= SPLIT CONTENT AREA ================= */}
          {/* This area scales dynamically based on available screen height */}
          <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-6 lg:gap-10 items-stretch">
            {/* LEFT COLUMN: UPLOAD SECTION */}
            <section className="flex-1 min-h-0 flex flex-col">
              <div className="shrink-0 flex items-center justify-between mb-3">
                <h2 className="text-xs lg:text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-5 h-5 bg-[#0269ff] text-white flex items-center justify-center text-[10px]">
                    1
                  </span>
                  Document Upload
                </h2>
              </div>

              {/* Drag & Drop Zone: flex-1 allows it to stretch and squash properly */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`
                  flex-1 min-h-0 relative border-2 border-dashed p-4 flex flex-col items-center justify-center text-center transition-all duration-200 bg-slate-50/50
                  ${
                    dragActive
                      ? "border-[#0269ff] bg-blue-50/30"
                      : "border-slate-200 hover:border-[#0269ff]/50"
                  }
                `}
              >
                <div className="text-3xl lg:text-4xl mb-2 opacity-80">📁</div>
                <p className="font-bold text-slate-700 text-sm lg:text-base tracking-tight">
                  Drag & Drop Files Here
                </p>
                <p className="text-[9px] lg:text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-widest">
                  PDF, DOC, DOCX, JPG, PNG
                </p>

                <div className="mt-4 shrink-0">
                  <label className="cursor-pointer inline-flex items-center justify-center px-6 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider hover:text-[#0269ff] hover:border-[#0269ff] transition-all shadow-sm">
                    Browse Files
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Selected File Details */}
              <div className="shrink-0 mt-3 h-14 lg:h-16 w-full">
                {file ? (
                  <div className="h-full p-3 bg-[#0269ff]/5 border border-[#0269ff]/20 animate-fade-in flex items-center justify-between">
                    <div className="pr-3 overflow-hidden">
                      <p className="font-bold text-[#0269ff] text-xs truncate">
                        {file.name}
                      </p>
                      <p className="text-[9px] font-semibold text-slate-500 mt-0.5 uppercase tracking-wider">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <div className="text-green-600 bg-green-50 px-2 py-1 text-[9px] font-bold uppercase tracking-widest shrink-0">
                      Ready
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center gap-4 text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <p className="flex items-center gap-1.5">
                      <span className="text-[#0269ff]">✔</span> PDF
                    </p>
                    <p className="flex items-center gap-1.5">
                      <span className="text-[#0269ff]">✔</span> Word
                    </p>
                    <p className="flex items-center gap-1.5">
                      <span className="text-[#0269ff]">✔</span> Images
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* RIGHT COLUMN: PREVIEW SECTION */}
            <section className="flex-1 min-h-0 flex flex-col">
              <div className="shrink-0 flex items-center justify-between mb-3 lg:pt-0 pt-4 border-t border-slate-100 lg:border-none">
                <h2 className="text-xs lg:text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-5 h-5 bg-[#0269ff] text-white flex items-center justify-center text-[10px]">
                    2
                  </span>
                  Document Preview
                </h2>
              </div>

              {/* Preview Box: Fully flexible */}
              <div className="flex-1 min-h-0 relative flex flex-col items-center justify-center">
                {/* No File State */}
                {!file && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                    <svg
                      className="w-10 h-10 mb-2 text-slate-200"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-[10px] lg:text-xs font-bold uppercase tracking-widest text-slate-300">
                      Preview Area
                    </p>
                  </div>
                )}

                {/* PDF Preview */}
                {file?.type === "application/pdf" && (
                  <iframe
                    src={previewUrl}
                    title="PDF Preview"
                    className="w-full h-full animate-fade-in border-none bg-slate-50/50"
                  />
                )}

                {/* Image Preview */}
                {file?.type?.startsWith("image/") && (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-contain animate-fade-in"
                  />
                )}

                {/* DOC/DOCX Fallback */}
                {(file?.name?.endsWith(".doc") ||
                  file?.name?.endsWith(".docx")) && (
                  <div className="h-full w-full flex flex-col items-center justify-center text-slate-500 animate-fade-in">
                    <div className="text-5xl lg:text-7xl mb-3">📄</div>
                    <p className="font-bold text-slate-800 text-xs lg:text-sm px-4 text-center truncate w-full max-w-sm">
                      {file.name}
                    </p>
                    <p className="mt-2 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                      Visual preview unavailable for Word Docs
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* ================= FOOTER BUTTON ================= */}
          <div className="shrink-0 mt-4 lg:mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="hidden sm:flex flex-col">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                Step 2 of 2
              </span>
              <span className="text-xs lg:text-sm font-semibold text-slate-800">
                Process Document
              </span>
            </div>

            <button
              onClick={uploadFile}
              disabled={loading || !file}
              className={`
                w-full sm:w-auto h-10 lg:h-12 px-6 lg:px-8 text-xs font-bold tracking-widest uppercase shadow-md transition-all duration-200 flex justify-center items-center gap-2 lg:gap-3
                ${
                  loading || !file
                    ? "bg-slate-200 text-slate-400 shadow-none cursor-not-allowed"
                    : "bg-[#0269ff] text-white hover:bg-[#0256d6] shadow-[#0269ff]/30 hover:shadow-[#0269ff]/50 hover:-translate-y-0.5"
                }
              `}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-3.5 w-3.5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Extracting...
                </>
              ) : (
                <>
                  Extract Information
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      <style jsx="true">{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default UploadDocument;
