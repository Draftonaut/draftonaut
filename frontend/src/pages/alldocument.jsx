import { useState } from "react";
import { useNavigate } from "react-router-dom";
import bgImage from "../assets/formbg.webp";
import logo from "../assets/logoblue.png";

// Import your new document thumbnail images
import agreementForSaleImg from "../assets/agreementforsale.png";
import declarationImg from "../assets/declaration.png";
import indemnityBondImg from "../assets/Indemitybond.png";
import commonFormImg from "../assets/commonform.png";
import affidavitImg from "../assets/affidavit.png";

function AllDocuments() {
  const navigate = useNavigate();
  const [selectedDocs, setSelectedDocs] = useState([]);

  // State for our custom error pop-up (Toast)
  const [showError, setShowError] = useState(false);

  // Structured our documents as an array of objects
  const availableDocuments = [
    {
      id: "Agreement for Sale",
      title: "Agreement for Sale",
      type: "standalone",
      publisher: "draftonaut",
      image: agreementForSaleImg,
    },
    {
      id: "Declaration",
      title: "Declaration Template",
      type: "groupable",
      publisher: "draftonaut",
      image: declarationImg,
    },
    {
      id: "Indemnity Bond",
      title: "Indemnity Bond Template",
      type: "groupable",
      publisher: "draftonaut",
      image: indemnityBondImg,
    },
    {
      id: "Common Form",
      title: "Common Legal Form",
      type: "groupable",
      publisher: "draftonaut",
      image: commonFormImg,
    },
    {
      id: "Affidavit",
      title: "Affidavit Template",
      type: "groupable",
      publisher: "draftonaut",
      image: affidavitImg,
    },
  ];

  const groupableDocs = availableDocuments
    .filter((doc) => doc.type === "groupable")
    .map((doc) => doc.id);

  const handleChange = (docId) => {
    // Hide error if they start selecting things
    if (showError) setShowError(false);

    if (docId === "Agreement for Sale") {
      if (selectedDocs.includes("Agreement for Sale")) {
        setSelectedDocs([]);
      } else {
        setSelectedDocs(["Agreement for Sale"]);
      }
    } else {
      let newDocs = [...selectedDocs];
      newDocs = newDocs.filter((d) => d !== "Agreement for Sale");

      if (newDocs.includes(docId)) {
        newDocs = newDocs.filter((d) => d !== docId);
      } else {
        newDocs.push(docId);
      }
      setSelectedDocs(newDocs);
    }
  };

  const handleAllDocs = (checked) => {
    if (showError) setShowError(false);

    if (checked) {
      setSelectedDocs([...groupableDocs]);
    } else {
      setSelectedDocs([]);
    }
  };

  const handleContinue = () => {
    if (selectedDocs.length === 0) {
      // Trigger the custom toast pop-up instead of alert()
      setShowError(true);

      // Auto-hide the error after 3 seconds
      setTimeout(() => {
        setShowError(false);
      }, 3000);
      return;
    }

    if (selectedDocs.includes("Agreement for Sale")) {
      navigate("/new-agreement");
    } else {
      localStorage.setItem("selectedDocuments", JSON.stringify(selectedDocs));
      navigate("/document-generator");
    }
  };

  return (
    <>
      <style>
        {`
          .font-futura {
            font-family: "Futura PT", system-ui, -apple-system, sans-serif;
          }
          
          .custom-slim-scroll::-webkit-scrollbar {
            width: 6px;
          }
          .custom-slim-scroll::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-slim-scroll::-webkit-scrollbar-thumb {
            background-color: rgba(203, 213, 225, 0.8); /* slate-300 */
            border-radius: 10px;
          }
          .custom-slim-scroll::-webkit-scrollbar-thumb:hover {
            background-color: rgba(148, 163, 184, 0.9); /* slate-400 */
          }

          @keyframes slide-in-top {
            0% { transform: translate(-50%, -20px); opacity: 0; }
            100% { transform: translate(-50%, 0); opacity: 1; }
          }
          .animate-toast {
            animation: slide-in-top 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}
      </style>

      {/* CUSTOM ERROR TOAST */}
      {showError && (
        <div className="fixed top-8 left-1/2 z-100 animate-toast font-futura">
          <div className="bg-red-500 text-white px-6 py-3.5 rounded-lg shadow-xl shadow-red-500/20 flex items-center gap-3 border border-red-400">
            <svg
              className="w-5 h-5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span className="font-semibold text-sm md:text-base">
              Please select at least one document.
            </span>
          </div>
        </div>
      )}

      <div className="h-screen w-full relative overflow-hidden font-futura">
        {/* FULL SCREEN BACKGROUND */}
        <div
          className="fixed inset-0 z-0"
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />

        {/* DESKTOP LOGO */}
        <img
          src={logo}
          alt="Logo"
          className="fixed top-6 left-12 h-15 object-contain z-50 hidden lg:block"
        />

        {/* RIGHT SIDE FORM CONTAINER */}
        <div className="absolute right-0 top-0 h-full w-full lg:w-1/2 z-10 flex flex-col bg-white/95 backdrop-blur-md shadow-2xl overflow-y-auto custom-slim-scroll">
          <div className="w-full flex flex-col px-5 sm:px-10 lg:px-12 max-w-5xl mx-auto pt-4 pb-12">
            {/* MOBILE LOGO */}
            <div className="w-full flex justify-center lg:hidden mb-2 ">
              <img src={logo} alt="Logo" className="h-15 object-contain" />
            </div>

            {/* Header Section */}
            <div className="mb-3 flex items-center gap-2">
              <h1 className="text-2xl mt-7 sm:text-3xl font-semibold text-slate-900 tracking-tight">
                Select your Legal Templates
              </h1>
              <svg
                className="w-5 h-5  text-slate-400 mt-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <p className="text-xs sm:text-base text-[#7262EF] mb-8 max-w-full">
              Access professionally verified, industry-standard document
              templates in just a few clicks. Spend less time on paperwork and
              more time growing your business. Leave the drafting to Draftonaut.
            </p>

            {/* STANDALONE DOCUMENTS GRID */}
            <div className="mb-8">
              <h2 className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                Standalone Agreements
              </h2>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {availableDocuments
                  .filter((doc) => doc.type === "standalone")
                  .map((doc) => {
                    const isSelected = selectedDocs.includes(doc.id);
                    return (
                      <div
                        key={doc.id}
                        onClick={() => handleChange(doc.id)}
                        className={`cursor-pointer group flex flex-col transition-all ${
                          isSelected
                            ? "opacity-100"
                            : "opacity-90 hover:opacity-100"
                        }`}
                      >
                        {/* Image Thumbnail Card */}
                        <div
                          className={`relative bg-white aspect-3/4 mb-2.5 rounded-lg border flex flex-col shadow-sm transition-all overflow-hidden ${
                            isSelected
                              ? "border-blue-600 ring-2 ring-blue-600 ring-offset-2"
                              : "border-slate-200 group-hover:border-slate-300 group-hover:shadow-md"
                          }`}
                        >
                          <img
                            src={doc.image}
                            alt={doc.title}
                            className="w-full h-full object-cover object-top"
                          />

                          {/* Selection Check Circle */}
                          {isSelected && (
                            <div className="absolute bottom-2 right-2 bg-blue-600 text-white rounded-full p-1 shadow-md">
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="3"
                                  d="M5 13l4 4L19 7"
                                ></path>
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Meta Info */}
                        <p className="text-[10px] sm:text-xs text-slate-500 mb-0.5 truncate">
                          Published by{" "}
                          <span className="text-blue-600">{doc.publisher}</span>
                        </p>
                        <h3 className="font-semibold text-xs sm:text-sm text-slate-900 leading-snug pr-2">
                          {doc.title}
                        </h3>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="w-full h-px bg-slate-200 mb-8"></div>

            {/* GROUPABLE DOCUMENTS GRID */}
            <div className="mb-6">
              <div className="flex justify-between items-end mb-4">
                <h2 className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider">
                  Bundle Documents
                </h2>
                {/* Select All Checkbox */}
                <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-blue-600 cursor-pointer hover:text-blue-700">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-blue-600 cursor-pointer rounded border-slate-300"
                    checked={groupableDocs.every((doc) =>
                      selectedDocs.includes(doc),
                    )}
                    onChange={(e) => handleAllDocs(e.target.checked)}
                  />
                  Select All
                </label>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {availableDocuments
                  .filter((doc) => doc.type === "groupable")
                  .map((doc) => {
                    const isSelected = selectedDocs.includes(doc.id);
                    return (
                      <div
                        key={doc.id}
                        onClick={() => handleChange(doc.id)}
                        className={`cursor-pointer group flex flex-col transition-all ${
                          isSelected
                            ? "opacity-100"
                            : "opacity-90 hover:opacity-100"
                        }`}
                      >
                        {/* Image Thumbnail Card */}
                        <div
                          className={`relative bg-white aspect-3/4 mb-2.5 rounded-lg border flex flex-col shadow-sm transition-all overflow-hidden ${
                            isSelected
                              ? "border-blue-600 ring-2 ring-blue-600 ring-offset-2"
                              : "border-slate-200 group-hover:border-slate-300 group-hover:shadow-md"
                          }`}
                        >
                          <img
                            src={doc.image}
                            alt={doc.title}
                            className="w-full h-full object-cover object-top"
                          />

                          {/* Selection Check Circle */}
                          {isSelected && (
                            <div className="absolute bottom-2 right-2 bg-blue-600 text-white rounded-full p-1 shadow-md">
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="3"
                                  d="M5 13l4 4L19 7"
                                ></path>
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Meta Info */}
                        <p className="text-[10px] sm:text-xs text-slate-500 mb-0.5 truncate">
                          Published by{" "}
                          <span className="text-blue-600">{doc.publisher}</span>
                        </p>
                        <h3 className="font-semibold text-xs sm:text-sm text-slate-900 leading-snug pr-2">
                          {doc.title}
                        </h3>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Sticky Continue Button Bottom Bar */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <button
                onClick={handleContinue}
                className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white py-3.5 md:py-4 text-sm sm:text-base md:text-lg font-semibold transition-all shadow-lg shadow-blue-600/20 rounded-md flex justify-center items-center gap-2"
              >
                Continue with {selectedDocs.length} Document
                {selectedDocs.length !== 1 ? "s" : ""}
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AllDocuments;
