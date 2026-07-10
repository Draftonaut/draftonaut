import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import logo from "../assets/logoblue.png";
import bgImage from "../assets/agreementbg.png";

function ReviewData() {
  const navigate = useNavigate();

  const pdfText = localStorage.getItem("pdfText") || "";

  const [history, setHistory] = useState("");
  const [loading, setLoading] = useState(false);

  const extractHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        "https://draftonaut.onrender.com/extract-history",
        {
          pdfText,
        },
      );
      const extractedHistory = response.data.history || "";
      setHistory(extractedHistory);
      localStorage.setItem("ownershipHistory", extractedHistory);
    } catch (error) {
      console.log(error);
      alert("History Extraction Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (!history) {
      alert("Please extract ownership history before continuing.");
      return;
    }
    navigate("/generate-agreement");
  };

  return (
    <div
      className="h-screen w-screen overflow-hidden bg-cover bg-center bg-no-repeat relative bg-slate-50 flex flex-col"
      style={{
        backgroundImage: `url(${bgImage})`,
        fontFamily: "Futura PT, Futura, sans-serif",
      }}
    >
      {/* 1. MOBILE HEADER */}
      <div className="lg:hidden shrink-0 h-16 bg-white/95 backdrop-blur-md z-50 flex items-center justify-center border-b border-slate-200">
        <img
          src={logo}
          alt="LegalTech"
          className="h-10 object-contain cursor-pointer"
          onClick={() => navigate("/")}
        />
      </div>

      {/* 2. DESKTOP LOGO */}
      <div className="hidden lg:flex shrink-0 w-full items-center justify-center pt-6 pb-2 relative z-20">
        <img
          src={logo}
          alt="LegalTech"
          className="h-14 object-contain drop-shadow-md cursor-pointer transition-transform hover:scale-105"
          onClick={() => navigate("/")}
        />
      </div>

      {/* 3. MAIN CONTENT: Maximized for legibility */}
      <div className="flex-1 min-h-0 w-full flex justify-center items-center p-3 lg:p-6 relative z-10">
        {/* CONTAINER CARD: Sharp edges, optimized height */}
        <div className="w-full h-full max-w-7xl bg-white/95 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-none flex flex-col p-4 lg:p-6">
          {/* HEADER */}
          <div className="shrink-0 border-b border-slate-200 pb-3 mb-3 text-center lg:text-left">
            <h1 className="text-lg lg:text-2xl font-bold text-slate-800 tracking-tight">
              Review Extracted Information
            </h1>
          </div>

          {/* SPLIT AREA: Now uses 1/2 of screen height each to maximize readability */}
          <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4">
            {/* LEFT COLUMN: PDF TEXT */}
            <section className="flex-1 min-h-0 flex flex-col">
              <h2 className="shrink-0 text-xs font-bold text-[#0269ff] uppercase mb-2">
                Extracted PDF Text
              </h2>
              <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar bg-slate-50 border border-slate-200 p-4 lg:p-6 rounded-none">
                <div className="whitespace-pre-wrap text-xs lg:text-sm leading-relaxed text-slate-700">
                  {pdfText || "No text extracted."}
                </div>
              </div>
            </section>

            {/* RIGHT COLUMN: OWNERSHIP HISTORY */}
            <section className="flex-1 min-h-0 flex flex-col">
              <h2 className="shrink-0 text-xs font-bold text-[#0269ff] uppercase mb-2">
                Ownership History
              </h2>
              <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar bg-slate-50 border border-slate-200 p-4 lg:p-6 rounded-none">
                {history ? (
                  <div className="whitespace-pre-wrap text-xs lg:text-sm leading-relaxed text-slate-700 animate-fade-in">
                    {history}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <p className="text-[10px] font-bold uppercase">
                      Pending Extraction
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* FOOTER BUTTONS */}
          <div className="shrink-0 flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
            <button
              onClick={extractHistory}
              disabled={loading}
              className="h-10 px-6 bg-white border-2 border-[#0269ff] text-[#0269ff] text-[11px] font-bold uppercase tracking-widest hover:bg-blue-50 transition-none rounded-none"
            >
              {loading ? "Processing..." : "Extract History"}
            </button>
            <button
              onClick={handleContinue}
              className="h-10 px-8 bg-[#0269ff] text-white text-[11px] font-bold uppercase tracking-widest hover:bg-[#0256d6] transition-none rounded-none"
            >
              Continue
            </button>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 0px;
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export default ReviewData;
