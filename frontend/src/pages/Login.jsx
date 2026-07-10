import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import logo from "../assets/logo.png";
import bgImage from "../assets/background.png"; // UPDATE THIS PATH

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  // Find out where the user came from (defaults to dashboard "/")
  const from = location.state?.from?.pathname || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      // Navigate the user back to the exact page they clicked on
      navigate(from, { replace: true });
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
      <div className="absolute top-0 left-0 p-6 w-full  z-20">
        <img src={logo} alt="LegalTech" className="h-16 object-contain" />
      </div>

      {/* Login Card (Left Aligned) */}
      <div className="relative z-10 w-full max-w-xl ml-0 md:ml-20 px-15 pt-7">
        <form
          onSubmit={handleLogin}
          className="bg-white/10 backdrop-blur-md p-6  shadow-2xl"
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
              placeholder="Email Address "
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

          {/* Remember + Forgot */}
          <div className="flex justify-between items-center text-xs text-[#0269FF] mb-5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={() => setRemember(!remember)}
                className="w-3 h-3"
              />
              Remember me
            </label>

            <button type="button" className=" hover:text-white/80">
              Forgot password?
            </button>
          </div>

          {/* Login Button */}
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
            {loading ? "Signing In..." : "Login"}
          </button>

          <p className=" text-white text-sm mt-6">
            Don't have an account?
            <Link to="/signup" className="ml-1 font-semibold hover:underline">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
