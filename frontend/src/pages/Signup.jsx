import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import logo from "../assets/logo.png";
import bgImage from "../assets/background.webp";

function Signup() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Changed to "fixed inset-0 h-screen" to lock the view and prevent scrolling
    <div className="fixed inset-0 h-screen w-full flex items-center justify-start overflow-hidden">
      {/* Background Image with Dark Overlay for readability */}
      <img
        src={bgImage}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Top Navbar-like Logo Position */}
      <div className="absolute top-0 left-0 w-full p-6 z-20">
        <img src={logo} alt="LegalTech" className="h-16 object-contain" />
      </div>

      {/* Signup Card (Left Aligned - Same to Same Layout) */}
      <div className="relative z-10 w-full max-w-xl ml-0 md:ml-20 px-15 pt-7">
        <form
          onSubmit={handleSignup}
          className="bg-white/10 backdrop-blur-md p-6 shadow-2xl"
        >
          <img
            src={logo}
            alt="LegalTech"
            className="h-12 mb-4 object-contain"
          />

          {/* Email */}
          <div className="mb-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="
                  w-full
                  h-12
                  px-4
                  bg-white
                  border
                  border-[#0269FF]
                  text-[#0269FF]
                  placeholder:text-[#0269FF]
                  outline-none
                  focus:border-white/40
                "
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="
                  w-full
                  h-12
                  px-4
                  bg-white
                  border
                  border-[#0269FF]
                  text-[#0269FF]
                  placeholder:text-[#0269FF]
                  outline-none
                  focus:border-white/40
                "
            />
          </div>

          {/* Confirm Password */}
          <div className="mb-5">
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              className="
                  w-full
                  h-12
                  px-4
                  bg-white
                  border
                  border-[#0269FF]
                  text-[#0269FF]
                  placeholder:text-[#0269FF]
                  outline-none
                  focus:border-white/40
                "
            />
          </div>

          {/* Signup Button */}
          <button
            type="submit"
            disabled={loading}
            className="
                w-full
                h-12
                bg-white
                text-[#0269FF]
                font-semibold
                hover:bg-gray-100
                transition
              "
          >
            {loading ? "Signing Up..." : "Register"}
          </button>

          <p className="text-white text-sm mt-6">
            Already have an account?
            <Link to="/login" className="ml-1 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Signup;
