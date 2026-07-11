import { useState, useEffect } from "react";
import { Editor } from "@tinymce/tinymce-react";
import html2pdf from "html2pdf.js";
import logo from "../assets/logoblue.png";

function DocumentPreview() {
  const documents = JSON.parse(
    localStorage.getItem("generatedDocuments") || "[]",
  );

  const [selectedDoc, setSelectedDoc] = useState(documents[0] || null);
  const [editorContent, setEditorContent] = useState("");

  // State for Page Size (A4 vs Legal)
  const [pageSize, setPageSize] = useState("a4");

  // State to control the right-hand hint slider on mobile/tablet
  const [isHintOpen, setIsHintOpen] = useState(false);

  // Sync editor content state whenever a new document is selected
  useEffect(() => {
    if (selectedDoc) {
      setEditorContent(selectedDoc.html);
    }
  }, [selectedDoc]);

  // --- DOWNLOAD HANDLERS ---

  const handleDownloadPDF = () => {
    if (!selectedDoc) return;

    const element = document.createElement("div");
    element.innerHTML = editorContent;

    const options = {
      margin: 0.5,
      filename: `${selectedDoc.title || "document"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "in", format: pageSize, orientation: "portrait" },
    };

    html2pdf().set(options).from(element).save();
  };

  const handleDownloadDOCX = () => {
    if (!selectedDoc) return;

    // Define correct dimensions for MS Word
    const isA4 = pageSize === "a4";
    const sizeStr = isA4 ? "8.27in 11.69in" : "8.5in 14.0in";

    // Inject strict Microsoft Office XML and Print View settings
    const header = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:w="urn:schemas-microsoft-com:office:word"
            xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>${selectedDoc.title || "Export Document"}</title>
        <style>
          @page WordSection1 {
            size: ${sizeStr};
            margin: 1.0in 1.0in 1.0in 1.0in;
            mso-header-margin: 0.5in;
            mso-footer-margin: 0.5in;
            mso-paper-source: 0;
          }
          div.WordSection1 {
            page: WordSection1;
          }
          body { 
            font-family: 'Times New Roman', Times, serif; 
            font-size: 12pt; 
            line-height: 1.5; 
            color: #000000; 
          }
          p {
            margin-top: 0;
            margin-bottom: 10pt;
          }
          table { width: 100%; border-collapse: collapse; }
          td, th { border: 1px solid black; padding: 5px; }
        </style>
      </head>
      <body>
        <div class="WordSection1">
    `;

    const footer = "</div></body></html>";
    const sourceHTML = header + editorContent + footer;

    // Use application/msword to ensure MS Word handles it
    const blob = new Blob(["\ufeff", sourceHTML], {
      type: "application/msword",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedDoc.title || "document"}.doc`;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen flex flex-col md:flex-row bg-slate-100 overflow-hidden relative">
      {/* MOBILE HEADER */}
      <div className="md:hidden w-full bg-white shadow-sm flex items-center justify-between py-3 px-4 border-b border-slate-200 shrink-0 z-20">
        <img src={logo} alt="Logo" className="h-8 object-contain" />
        <button
          onClick={() => setIsHintOpen(true)}
          className="text-blue-600 font-bold text-sm bg-blue-50 px-3 py-1.5 rounded"
        >
          💡 Hints
        </button>
      </div>

      {/* LEFT SIDEBAR (Documents List) */}
      <div className="w-full md:w-65 bg-white border-b md:border-b-0 md:border-r border-slate-200 p-4 md:p-6 flex flex-col shrink-0 z-10 shadow-sm md:shadow-none overflow-y-auto max-h-48 md:max-h-full">
        <div className="hidden md:block mb-8">
          <img src={logo} alt="Logo" className="h-15 object-contain" />
        </div>

        <h2 className="text-sm md:text-lg font-bold mb-3 md:mb-6 text-slate-400 uppercase tracking-wider">
          Documents
        </h2>

        <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 hide-scrollbar">
          {documents.map((doc) => (
            <button
              key={doc.title}
              onClick={() => setSelectedDoc(doc)}
              className={`
                whitespace-nowrap md:whitespace-normal
                text-left p-3 border rounded transition-colors text-sm
                ${
                  selectedDoc?.title === doc.title
                    ? "bg-[#0055ff] border-[#0055ff] text-white font-bold shadow-md"
                    : "bg-white border-slate-200 hover:border-[#0055ff] hover:text-[#0055ff] text-slate-700 font-medium"
                }
              `}
            >
              {doc.title}
            </button>
          ))}
        </div>
      </div>

      {/* CENTER WORKSPACE (Editor) */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center bg-[#f3f4f6]">
        {selectedDoc ? (
          <div className="w-full max-w-204 flex flex-col">
            {/* ACTION BAR */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-white p-4 shadow-sm rounded-lg border border-slate-200 gap-4">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <h3 className="text-base md:text-lg font-bold text-slate-800">
                  {selectedDoc.title}
                </h3>
              </div>

              <div className="flex gap-2 w-full sm:w-auto items-center">
                {/* Desktop Toggle Hint Button */}
                <button
                  onClick={() => setIsHintOpen(true)}
                  className="hidden md:block lg:hidden px-4 py-2 bg-slate-100 text-slate-700 rounded hover:bg-slate-200 font-bold text-xs md:text-sm transition-colors border border-slate-300"
                >
                  💡 Hints
                </button>

                {/* Page Size Toggle */}
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-300 rounded text-sm font-bold text-slate-700 outline-none focus:border-[#0055ff] transition-colors"
                >
                  <option value="a4">A4 Size</option>
                  <option value="legal">Legal Size</option>
                </select>

                <button
                  onClick={handleDownloadPDF}
                  className="flex-1 sm:flex-none px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-bold text-xs md:text-sm transition-colors shadow-sm"
                >
                  PDF
                </button>
                <button
                  onClick={handleDownloadDOCX}
                  className="flex-1 sm:flex-none px-4 py-2 bg-[#0055ff] text-white rounded hover:bg-blue-700 font-bold text-xs md:text-sm transition-colors shadow-sm"
                >
                  Word
                </button>
              </div>
            </div>

            {/* A4/LEGAL PAGE STYLED EDITOR */}
            <div
              className="w-full bg-white shadow-2xl ring-1 ring-slate-900/5 sm:mx-auto transition-all duration-300"
              style={{ maxWidth: pageSize === "legal" ? "816px" : "794px" }}
            >
              <Editor
                key={selectedDoc?.title || "editor"}
                apiKey="xxn6qkavv3x208h2dmjgvoqsu3jb31b114sqz4mk7uq49xag"
                initialValue={selectedDoc?.html}
                onEditorChange={(newValue) => setEditorContent(newValue)}
                init={{
                  license_key: "gpl",
                  height: pageSize === "legal" ? 1000 : 900,
                  menubar: false,
                  statusbar: false,
                  plugins: [
                    "advlist",
                    "autolink",
                    "lists",
                    "link",
                    "image",
                    "charmap",
                    "preview",
                    "anchor",
                    "searchreplace",
                    "visualblocks",
                    "code",
                    "fullscreen",
                    "insertdatetime",
                    "media",
                    "table",
                    "help",
                    "wordcount",
                  ],
                  toolbar:
                    "undo redo | formatselect | " +
                    "bold italic underline | alignleft aligncenter " +
                    "alignright alignjustify | bullist numlist | " +
                    "table | removeformat",
                  content_style: `
                    body { 
                      font-family: 'Times New Roman', Times, serif; 
                      font-size: 12pt; 
                      line-height: 1.6;
                      padding: 48px; 
                      color: #000;
                      background: #fff;
                    }
                    table { width: 100%; border-collapse: collapse; }
                    td, th { border: 1px solid black; padding: 5px; }
                    @media (max-width: 600px) {
                      body { padding: 20px; }
                    }
                  `,
                }}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <svg
              className="w-16 h-16 mb-4 text-slate-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-lg font-medium">Select a document to preview</p>
          </div>
        )}
      </div>

      {/* RIGHT SIDEBAR (Hint Slider) */}
      {isHintOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsHintOpen(false)}
        />
      )}

      <div
        className={`
        fixed inset-y-0 right-0 z-40 w-70 lg:w-[320px] bg-white border-l border-slate-200 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col
        lg:relative lg:translate-x-0 lg:shadow-none
        ${isHintOpen ? "translate-x-0" : "translate-x-full"}
      `}
      >
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-blue-50/50">
          <div className="flex items-center gap-2 text-blue-700">
            <span className="text-xl">💡</span>
            <h2 className="font-extrabold text-sm uppercase tracking-wide">
              Document Guide
            </h2>
          </div>
          <button
            onClick={() => setIsHintOpen(false)}
            className="lg:hidden text-slate-400 hover:text-red-500 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
            <h3 className="font-bold text-amber-800 text-sm mb-2">
              Important Review
            </h3>
            <p className="text-xs text-amber-700 leading-relaxed">
              Please double-check all dynamic variables inserted into this
              document. Ensure that the <strong>PAN numbers</strong>,{" "}
              <strong>Distinctive Share Numbers</strong>, and{" "}
              <strong>Consideration Amounts</strong> match your official records
              before downloading.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-800 text-sm mb-3 border-b border-slate-100 pb-2">
              Formatting Tips
            </h3>
            <ul className="space-y-3">
              <li className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs shrink-0 mt-0.5">
                  1
                </div>
                <p className="text-xs text-slate-600">
                  Use the <strong className="text-slate-800">Toolbar</strong>{" "}
                  above the document to fix any alignment issues.
                </p>
              </li>
              <li className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs shrink-0 mt-0.5">
                  2
                </div>
                <p className="text-xs text-slate-600">
                  If text is cut off, ensure you haven't accidentally inserted a
                  wide table. The document acts as a standard page.
                </p>
              </li>
              <li className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs shrink-0 mt-0.5">
                  3
                </div>
                <p className="text-xs text-slate-600">
                  You can freely type directly into the document to add custom
                  clauses before downloading.
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentPreview;
