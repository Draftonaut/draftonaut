import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

// Import your logo from the assets folder here
import logo from "./assets/logoblue.png"; // <--- UPDATE EXTENSION IF NEEDED (.svg, .jpg, etc)

// Firebase setup
import { auth } from "./firebase";

// Pages
import Dashboard from "./pages/Dashboard";
import NewAgreement from "./pages/NewAgreement";
import UploadDocument from "./pages/UploadDocument";
import ReviewData from "./pages/ReviewData";
import OwnershipHistory from "./pages/OwnershipHistory";
import GenerateAgreement from "./pages/GenerateAgreement";
import AllDocuments from "./pages/alldocument";
import DocumentGenerator from "./pages/DocumentGenerator";
import DocumentPreview from "./pages/DocumentPreview";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// =====================================
// PROTECTED ROUTE COMPONENT
// =====================================

function ProtectedRoute({ children }) {
  const [user, setUser] = useState(undefined);
  const location = useLocation(); // 1. Added useLocation to track where they clicked

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {/* Custom style for glow and fade effect */}
        <style>
          {`
            @keyframes glow-fade {
              0%, 100% {
                opacity: 0.5;
                filter: drop-shadow(0 0 5px rgba(59, 130, 246, 0.4));
                transform: scale(0.95);
              }
              50% {
                opacity: 1;
                filter: drop-shadow(0 0 25px rgba(59, 130, 246, 0.9));
                transform: scale(1.05);
              }
            }
            .animate-glow-fade {
              animation: glow-fade 2s ease-in-out infinite;
            }
          `}
        </style>

        {/* Using the imported logo variable here */}
        <img
          src={logo}
          alt="Loading App..."
          className="h-25 object-contain animate-glow-fade"
        />
      </div>
    );
  }

  // 2. Updated this line so it sends them to login, but remembers their location!
  return user ? (
    children
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
}

// =====================================
// MAIN APP COMPONENT
// =====================================

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ---------------- Public Routes ---------------- */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* 3. THIS IS THE FIX: The Dashboard is now public so everyone can see it! */}
        <Route path="/" element={<Dashboard />} />

        {/* ---------------- Protected Routes ---------------- */}
        <Route
          path="/new-agreement"
          element={
            <ProtectedRoute>
              <NewAgreement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/upload-document"
          element={
            <ProtectedRoute>
              <UploadDocument />
            </ProtectedRoute>
          }
        />

        <Route
          path="/review-data"
          element={
            <ProtectedRoute>
              <ReviewData />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ownership-history"
          element={
            <ProtectedRoute>
              <OwnershipHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/generate-agreement"
          element={
            <ProtectedRoute>
              <GenerateAgreement />
            </ProtectedRoute>
          }
        />

        {/* Continue Editing Saved Draft */}
        <Route
          path="/draft/:id"
          element={
            <ProtectedRoute>
              <GenerateAgreement />
            </ProtectedRoute>
          }
        />

        {/* All Documents Selection Page */}
        <Route
          path="/all-documents"
          element={
            <ProtectedRoute>
              <AllDocuments />
            </ProtectedRoute>
          }
        />

        {/* Declaration / Indemnity / Common Form Generator */}
        <Route
          path="/document-generator"
          element={
            <ProtectedRoute>
              <DocumentGenerator />
            </ProtectedRoute>
          }
        />

        <Route
          path="/document-preview"
          element={
            <ProtectedRoute>
              <DocumentPreview />
            </ProtectedRoute>
          }
        />

        {/* ---------------- Catch-All Invalid Route ---------------- */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
