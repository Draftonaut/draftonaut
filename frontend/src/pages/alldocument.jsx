import { useState } from "react";
import { useNavigate } from "react-router-dom";
import bgImage from "../assets/formbg.webp";
import logo from "../assets/logoblue.png";

function AllDocuments() {
  const navigate = useNavigate();
  const [selectedDocs, setSelectedDocs] = useState([]);

  const allAvailableDocs = [
    "Declaration",
    "Indemnity Bond",
    "Common Form",
    "Affidavit",
  ];

  const handleChange = (doc) => {
    if (selectedDocs.includes(doc)) {
      setSelectedDocs(selectedDocs.filter((d) => d !== doc));
    } else {
      setSelectedDocs([...selectedDocs, doc]);
    }
  };

  const handleAllDocs = (checked) => {
    if (checked) {
      setSelectedDocs(allAvailableDocs);
    } else {
      setSelectedDocs([]);
    }
  };

  const handleContinue = () => {
    if (selectedDocs.length === 0) {
      alert("Please select at least one document.");
      return;
    }

    localStorage.setItem("selectedDocuments", JSON.stringify(selectedDocs));
    navigate("/document-generator");
  };

  return (
    <div className="h-screen w-full relative overflow-hidden">
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

      {/* RIGHT SIDE FORM CONTAINER - Removed overflow-y-auto to kill the scroller */}
      <div className="absolute right-0 top-0 h-full w-full lg:w-1/2 z-10 flex flex-col bg-white/95 backdrop-blur-md shadow-2xl">
        {/* INNER CONTENT WRAPPER - Adjusted padding to fit perfectly in h-screen */}
        <div className="w-full flex flex-col px-6 sm:px-10 lg:px-16 max-w-2xl mx-auto lg:mx-0 pt-8 lg:pt-20">
          {/* MOBILE LOGO */}
          <div className="w-full flex justify-center lg:hidden mb-6">
            <img src={logo} alt="Logo" className="h-12 object-contain" />
          </div>

          {/* Header - Changed to mb-4 for a perfect gap */}
          <div className="mb-4">
            <span className="inline-block bg-blue-50 text-blue-600 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase px-3 py-1.5">
              AI POWERED DOCUMENTS
            </span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">
            Generate Documents
          </h1>

          <p className="text-sm md:text-base text-slate-500 mt-1">
            Select the documents you want to generate.
          </p>

          {/* Form Section */}
          <div className="border-t border-slate-200 mt-5 pt-5">
            <div className="flex items-center gap-3 md:gap-4 mb-5">
              <div className="w-8 h-8 md:w-9 md:h-9 bg-blue-600 text-white flex items-center justify-center font-bold text-sm md:text-base shrink-0">
                1
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900">
                Document Selection
              </h2>
            </div>

            {/* Checkbox Group */}
            <div className="border border-slate-200 p-4 md:p-5 bg-white/50 rounded-md">
              <div className="space-y-3">
                <label className="flex items-center gap-3 md:gap-4 text-base md:text-lg cursor-pointer group hover:text-blue-600 transition-colors">
                  <input
                    type="checkbox"
                    className="w-5 h-5 accent-blue-600 cursor-pointer shrink-0"
                    checked={selectedDocs.includes("Declaration")}
                    onChange={() => handleChange("Declaration")}
                  />
                  <span>Declaration</span>
                </label>

                <label className="flex items-center gap-3 md:gap-4 text-base md:text-lg cursor-pointer group hover:text-blue-600 transition-colors">
                  <input
                    type="checkbox"
                    className="w-5 h-5 accent-blue-600 cursor-pointer shrink-0"
                    checked={selectedDocs.includes("Indemnity Bond")}
                    onChange={() => handleChange("Indemnity Bond")}
                  />
                  <span>Indemnity Bond</span>
                </label>

                <label className="flex items-center gap-3 md:gap-4 text-base md:text-lg cursor-pointer group hover:text-blue-600 transition-colors">
                  <input
                    type="checkbox"
                    className="w-5 h-5 accent-blue-600 cursor-pointer shrink-0"
                    checked={selectedDocs.includes("Common Form")}
                    onChange={() => handleChange("Common Form")}
                  />
                  <span>Common Form</span>
                </label>

                <label className="flex items-center gap-3 md:gap-4 text-base md:text-lg cursor-pointer group hover:text-blue-600 transition-colors">
                  <input
                    type="checkbox"
                    className="w-5 h-5 accent-blue-600 cursor-pointer shrink-0"
                    checked={selectedDocs.includes("Affidavit")}
                    onChange={() => handleChange("Affidavit")}
                  />
                  <span>Affidavit</span>
                </label>

                {/* Divider for "All Documents" */}
                <div className="h-px w-full bg-slate-200 my-3"></div>

                <label className="flex items-center gap-3 md:gap-4 text-base md:text-lg font-semibold text-blue-600 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5 accent-blue-600 cursor-pointer shrink-0"
                    checked={selectedDocs.length === allAvailableDocs.length}
                    onChange={(e) => handleAllDocs(e.target.checked)}
                  />
                  <span>All Four Documents</span>
                </label>
              </div>

              <button
                onClick={handleContinue}
                className="
                  mt-6
                  w-full
                  bg-blue-600
                  hover:bg-blue-700
                  active:bg-blue-800
                  text-white
                  py-3
                  md:py-3.5
                  text-base
                  md:text-lg
                  font-semibold
                  transition-all
                  shadow-lg
                  shadow-blue-600/20
                  rounded-md
                "
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AllDocuments;
