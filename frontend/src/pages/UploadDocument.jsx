import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/logoblue.png";
import bgImage from "../assets/agreementbg.png";

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
      /* STRICTLY SINGLE SCREEN: h-screen and overflow-hidden disable all page scrolling */
      className="h-screen w-screen overflow-hidden bg-cover bg-center bg-no-repeat relative bg-slate-50 flex flex-col"
      style={{
        backgroundImage: `url(${bgImage})`,
        fontFamily: "Futura PT, Futura, sans-serif",
      }}
    >
      {/* 1. MOBILE HEADER: Untouched. Fixed height, white background, centered logo */}
      <div className="lg:hidden shrink-0 h-16 sm:h-20 bg-white/95 backdrop-blur-md z-50 flex items-center justify-center border-b border-slate-200">
        <img
          src={logo}
          alt="LegalTech"
          className="h-10 sm:h-12 object-contain cursor-pointer"
          onClick={() => navigate("/")}
        />
      </div>

      {/* 2. DESKTOP LOGO: Perfectly centered above the card, NOT absolute/overlay */}
      <div className="hidden lg:flex shrink-0 w-full items-center justify-center pt-8 pb-4 relative z-20">
        <img
          src={logo}
          alt="LegalTech"
          className="h-16 xl:h-20 object-contain drop-shadow-md cursor-pointer transition-transform hover:scale-105"
          onClick={() => navigate("/")}
        />
      </div>

      {/* 3. MAIN CONTENT WRAPPER: Perfectly centered below the logo on desktop, full height on mobile */}
      <div className="flex-1 min-h-0 w-full flex justify-center items-center p-4 lg:px-10 lg:pb-10 relative z-10">
        {/* PREMIUM CONTAINER CARD: Matches exactly to screen dimensions minus padding, sharp corners */}
        <div className="w-full h-full max-w-6xl bg-white/95 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-none flex flex-col p-5 lg:p-8">
          {/* HEADER ROW */}
          <div className="shrink-0 border-b border-slate-200 pb-4 mb-4 text-center lg:text-left">
            <div className="inline-flex items-center justify-center px-3 py-1 mb-2 bg-blue-50 border border-blue-100 text-[#0269ff] text-[10px] font-bold uppercase tracking-widest rounded-none">
              AI Powered Extraction
            </div>
            <h1 className="text-xl lg:text-3xl font-bold text-slate-800 tracking-tight">
              Upload Previous Agreement
            </h1>
            <p className="hidden sm:block text-xs lg:text-sm text-slate-500 mt-1">
              Provide your existing document, and our AI will automatically
              extract the necessary legal clauses and data.
            </p>
          </div>

          {/* ================= SPLIT CONTENT AREA ================= */}
          {/* min-h-0 ensures this grid shrinks perfectly to fit inside the screen without scrolling */}
          <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4 lg:gap-8">
            {/* LEFT COLUMN: UPLOAD SECTION */}
            <section className="flex-1 min-h-0 flex flex-col">
              <div className="shrink-0 flex items-center justify-between mb-3">
                <h2 className="text-sm lg:text-base font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-5 h-5 bg-[#0269ff] text-white flex items-center justify-center text-[10px] rounded-none">
                    1
                  </span>
                  Document Upload
                </h2>
              </div>

              {/* Drag & Drop Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`
                  flex-1 min-h-0 relative border-2 border-dashed p-4 flex flex-col items-center justify-center text-center transition-all duration-200 rounded-none bg-slate-50
                  ${
                    dragActive
                      ? "border-[#0269ff] bg-blue-50/50 shadow-inner"
                      : "border-slate-300 hover:border-[#0269ff]/50 hover:bg-slate-50/80"
                  }
                `}
              >
                <div className="text-4xl lg:text-5xl mb-2 opacity-80">📁</div>
                <p className="font-bold text-slate-700 text-sm lg:text-lg tracking-tight">
                  Drag & Drop Files Here
                </p>
                <p className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-widest">
                  PDF, DOC, DOCX, JPG, PNG
                </p>

                <div className="mt-4 lg:mt-6 shrink-0">
                  <label className="cursor-pointer inline-flex items-center justify-center px-6 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-bold uppercase tracking-wider hover:bg-slate-50 hover:text-[#0269ff] hover:border-[#0269ff] transition-all rounded-none shadow-sm">
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

              {/* Selected File Details / Supported Features */}
              <div className="shrink-0 mt-3 lg:mt-4 h-15 lg:h-18">
                {file ? (
                  <div className="h-full p-3 lg:p-4 bg-[#0269ff]/5 border border-[#0269ff]/20 rounded-none animate-fade-in flex items-center justify-between">
                    <div className="pr-4 overflow-hidden">
                      <p className="font-bold text-[#0269ff] text-xs lg:text-sm truncate">
                        {file.name}
                      </p>
                      <p className="text-[10px] font-semibold text-slate-500 mt-0.5 uppercase tracking-wider">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <div className="text-green-600 bg-green-50 px-2 lg:px-3 py-1 border border-green-200 text-[9px] lg:text-[10px] font-bold uppercase tracking-widest rounded-none shrink-0">
                      Ready
                    </div>
                  </div>
                ) : (
                  <div className="h-full grid grid-cols-2 gap-2 text-[9px] lg:text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100/50 p-2 lg:p-3 border border-slate-200 rounded-none items-center">
                    <p className="flex items-center gap-1.5 truncate">
                      <span className="text-[#0269ff]">✔</span> PDF
                    </p>
                    <p className="flex items-center gap-1.5 truncate">
                      <span className="text-[#0269ff]">✔</span> Word
                    </p>
                    <p className="flex items-center gap-1.5 truncate">
                      <span className="text-[#0269ff]">✔</span> Images
                    </p>
                    <p className="flex items-center gap-1.5 truncate">
                      <span className="text-[#0269ff]">✔</span> OCR
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* RIGHT COLUMN: PREVIEW SECTION */}
            <section className="flex-1 min-h-0 flex flex-col">
              <div className="shrink-0 flex items-center justify-between mb-3 lg:pt-0 pt-3 border-t border-slate-200 lg:border-none">
                <h2 className="text-sm lg:text-base font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-5 h-5 bg-[#0269ff] text-white flex items-center justify-center text-[10px] rounded-none">
                    2
                  </span>
                  Document Preview
                </h2>
              </div>

              {/* Preview Box: Takes exact remaining height of this column */}
              <div className="flex-1 min-h-0 border border-slate-200 bg-slate-100/50 overflow-hidden relative rounded-none flex items-center justify-center">
                {!file && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                    <svg
                      className="w-10 h-10 mb-2 text-slate-300"
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
                    <p className="text-[10px] lg:text-xs font-bold uppercase tracking-widest text-slate-400">
                      No Document Selected
                    </p>
                  </div>
                )}

                {/* PDF Preview */}
                {file?.type === "application/pdf" && (
                  <iframe
                    src={previewUrl}
                    title="PDF Preview"
                    className="w-full h-full animate-fade-in border-none"
                  />
                )}

                {/* Image Preview */}
                {file?.type?.startsWith("image/") && (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-contain p-2 animate-fade-in"
                  />
                )}

                {/* DOC/DOCX Fallback */}
                {(file?.name?.endsWith(".doc") ||
                  file?.name?.endsWith(".docx")) && (
                  <div className="h-full w-full flex flex-col items-center justify-center text-slate-500 animate-fade-in bg-white">
                    <div className="text-5xl lg:text-7xl mb-2 lg:mb-4 text-[#0269ff]">
                      📝
                    </div>
                    <p className="font-bold text-slate-700 text-sm lg:text-lg px-4 text-center truncate w-full">
                      {file.name}
                    </p>
                    <p className="mt-2 text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-100 px-3 py-1.5 rounded-none">
                      Visual preview unavailable
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* ================= FOOTER BUTTON ================= */}
          <div className="shrink-0 flex items-center justify-between mt-4 lg:mt-6 pt-4 lg:pt-6 border-t border-slate-200">
            <div className="hidden sm:flex flex-col">
              <span className="text-[9px] lg:text-[10px] text-slate-400 font-bold uppercase tracking-widest">
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
                w-full sm:w-auto h-10 lg:h-12 px-6 lg:px-8 text-xs lg:text-sm font-bold tracking-widest uppercase shadow-lg transition-all duration-200 flex justify-center items-center gap-2 lg:gap-3 rounded-none
                ${
                  loading || !file
                    ? "bg-slate-300 text-slate-500 shadow-none cursor-not-allowed"
                    : "bg-[#0269ff] text-white hover:bg-[#0256d6] shadow-[#0269ff]/30 hover:shadow-[#0269ff]/50 hover:-translate-y-0.5"
                }
              `}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
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
                    className="w-3.5 h-3.5 lg:w-4 lg:h-4"
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
      </div>

      <style jsx="true">{`
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out;
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
