import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import logo from "../assets/logoblue.png";
import mobileLogo from "../assets/logo.png";
import bgImage from "../assets/bg.webp";
import mobileBgImage from "../assets/mobilebg.webp";

function Navbar({ onMyWorkClick }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const userEmail = auth.currentUser?.email || "";
  const firstLetter = userEmail ? userEmail.charAt(0).toUpperCase() : "";

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 px-6"
      style={{
        background:
          "linear-gradient(180deg, rgba(2, 105, 255, 0.25) 0%, rgba(255, 255, 255, 0) 100%)",
      }}
    >
      <nav className="w-full h-20 flex items-center justify-between md:px-17">
        {/* Desktop Logo */}
        <img
          src={logo}
          alt="LegalTech"
          className="hidden md:block h-10 md:h-15 object-contain cursor-pointer"
          onClick={() => navigate("/")}
        />

        {/* Mobile Logo */}
        <img
          src={mobileLogo}
          alt="LegalTech"
          className="block md:hidden h-12 object-contain cursor-pointer"
          onClick={() => navigate("/")}
        />

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-8 ml-auto mr-8">
          <button
            onClick={onMyWorkClick}
            className="font-semibold text-white hover:text-blue-600 transition"
          >
            My Work
          </button>
          <button
            onClick={() => navigate("/pricing")}
            className="font-semibold text-white hover:text-blue-600 transition"
          >
            Pricing
          </button>
        </div>

        <div className="flex items-center gap-4">
          {/* Desktop Auth */}
          <div className="hidden md:block relative">
            {userEmail ? (
              <>
                <button
                  onClick={() => setOpen(!open)}
                  className="w-10 h-10 rounded-full bg-blue-600 text-white font-semibold shadow-md"
                >
                  {firstLetter}
                </button>
                {open && (
                  <div className="absolute right-0 top-14 w-72 bg-white shadow-xl border border-slate-200 overflow-hidden rounded-none">
                    <div className="p-4 border-b border-slate-100">
                      <p className="text-sm font-medium">{userEmail}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-red-500 hover:bg-slate-50 transition"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={handleLogin}
                className="bg-blue-600 text-white px-6 py-2 font-semibold hover:bg-blue-700 transition rounded-none"
              >
                Login
              </button>
            )}
          </div>

          {/* Slim Mobile Menu Icon */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1 text-white focus:outline-none hover:opacity-80 transition-opacity"
          >
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M4 7h16M4 12h16M4 17h16"
                />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Modern Glassmorphism Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-4 right-4 bg-white/95 backdrop-blur-xl shadow-2xl border border-slate-200/50 flex flex-col rounded-2xl overflow-hidden transition-all duration-300">
          <button
            onClick={() => {
              onMyWorkClick();
              setMobileMenuOpen(false);
            }}
            className="p-4 border-b border-slate-100 text-left font-semibold text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors"
          >
            My Work
          </button>
          <button
            onClick={() => {
              navigate("/pricing");
              setMobileMenuOpen(false);
            }}
            className="p-4 border-b border-slate-100 text-left font-semibold text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors"
          >
            Pricing
          </button>
          {userEmail ? (
            <button
              onClick={handleLogout}
              className="p-4 text-left font-semibold text-red-500 hover:bg-red-50 active:bg-red-100 transition-colors"
            >
              Logout ({userEmail})
            </button>
          ) : (
            <button
              onClick={() => {
                handleLogin();
                setMobileMenuOpen(false);
              }}
              className="p-4 text-left font-semibold text-blue-600 hover:bg-blue-50 active:bg-blue-100 transition-colors"
            >
              Login
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) getDrafts(user.uid);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getDrafts = async (uid) => {
    try {
      const response = await axios.get(
        `https://draftonaut.onrender.com/api/drafts/${uid}`,
      );
      setDrafts(response.data.drafts);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteDraft = async (e, draftId) => {
    e.stopPropagation();
    try {
      await axios.delete(
        `https://draftonaut.onrender.com/api/drafts/${draftId}`,
      );
      setDrafts(drafts.filter((draft) => draft._id !== draftId));
    } catch (error) {
      console.log(error);
    }
  };

  // NEW: Wrapper function to enforce login before executing an action
  const handleProtectedAction = (actionCallback) => {
    if (!auth.currentUser) {
      navigate("/login");
    } else {
      actionCallback();
    }
  };

  return (
    <>
      {/* Hides scrollbar globally for this component */}
      <style>
        {`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}
      </style>

      <div className="h-screen w-full overflow-y-auto hide-scrollbar relative">
        {/* FIXED BACKGROUND DIV */}
        <div
          className="fixed inset-0 z-[-1]"
          style={{
            backgroundImage: `url(${isMobile ? mobileBgImage : bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <div className="min-h-[120vh]">
          {/* UPDATED: Pass the protected action to Navbar so "My Work" requires login */}
          <Navbar
            onMyWorkClick={() =>
              handleProtectedAction(() => setShowPopup(true))
            }
          />

          {/* Fixed Glassmorphism Buttons */}
          <div className="fixed bottom-24 left-4 md:bottom-45 md:left-21 flex gap-2 md:gap-4 z-40">
            {/* UPDATED: Wrap navigate in protected action */}
            <button
              onClick={() =>
                handleProtectedAction(() => navigate("/new-agreement"))
              }
              className="bg-white/10 backdrop-blur-md border border-white/60 text-white md:border-blue-600 md:text-blue-600 px-4 py-2 text-xs md:text-base md:px-8 md:py-3 font-semibold rounded-none hover:bg-white/20 md:hover:bg-blue-600/10 transition-all duration-300"
            >
              Create New Agreement
            </button>

            {/* UPDATED: Wrap navigate in protected action */}
            <button
              onClick={() =>
                handleProtectedAction(() => navigate("/all-documents"))
              }
              className="bg-white/10 backdrop-blur-md border border-blue-400 text-blue-400 px-4 py-2 text-xs md:text-base md:px-8 md:py-3 font-semibold rounded-none hover:bg-blue-500/20 hover:text-blue-300 transition-all duration-300"
            >
              Other Documents
            </button>
          </div>
        </div>

        {/* Scrollable Popup Modal */}
        {showPopup && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl max-h-[80vh] flex flex-col rounded-none shadow-2xl">
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold">Document History</h2>
                <button
                  onClick={() => setShowPopup(false)}
                  className="text-2xl font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 overflow-y-auto grow space-y-4 hide-scrollbar">
                {drafts.length === 0 ? (
                  <p className="text-center text-slate-500">
                    No documents found.
                  </p>
                ) : (
                  drafts.map((draft) => (
                    <div
                      key={draft._id}
                      className="flex justify-between items-center border border-slate-200 p-4 rounded-none hover:bg-slate-50"
                    >
                      <div>
                        <h3 className="font-bold text-slate-800">
                          {draft.title}
                        </h3>
                        <p className="text-xs text-slate-500">
                          Status: {draft.status}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/draft/${draft._id}`)}
                          className="bg-blue-600 text-white px-4 py-1 text-sm rounded-none hover:bg-blue-700 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => deleteDraft(e, draft._id)}
                          className="bg-red-500 text-white px-4 py-1 text-sm rounded-none hover:bg-red-600 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Dashboard;
