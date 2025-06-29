"use client";

import React, { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Sun,
  Moon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

const AnimatedSignIn: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { signIn } = useAuth();
  const router = useRouter();

  // Email validation
  const validateEmail = (email: string) => {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  // Handle email change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (e.target.value) {
      setIsEmailValid(validateEmail(e.target.value));
    } else {
      setIsEmailValid(true);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsFormSubmitted(true);
    setLoading(true);
    setError("");

    if (email && password && validateEmail(email)) {
      try {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        } else {
          // Simulate successful login feedback
          const form = document.querySelector(".login-form") as HTMLElement;
          if (form) {
            form.classList.add("form-success");
            setTimeout(() => {
              form.classList.remove("form-success");
              router.push("/dashboard");
            }, 1500);
          }
        }
      } catch (err) {
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark-mode");
  };

  // Initialize theme based on user preference
  useEffect(() => {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setIsDarkMode(prefersDark);
    if (prefersDark) {
      document.documentElement.classList.add("dark-mode");
    }
  }, []);

  // Create particles
  useEffect(() => {
    const canvas = document.getElementById("particles") as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    // Particle class
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.color = isDarkMode
          ? `rgba(255, 255, 255, ${Math.random() * 0.2})`
          : `rgba(0, 0, 100, ${Math.random() * 0.2})`;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const particles: Particle[] = [];
    const particleCount = Math.min(
      100,
      Math.floor((canvas.width * canvas.height) / 15000)
    );

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const particle of particles) {
        particle.update();
        particle.draw();
      }

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", setCanvasSize);
    };
  }, [isDarkMode]);

  return (
    <div className={`login-container ${isDarkMode ? "dark" : "light"}`}>
      <canvas id="particles" className="particles-canvas"></canvas>

      <div className="theme-toggle" onClick={toggleDarkMode}>
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </div>

      <div className="login-card">
        <div className="login-card-inner">
          <div className="login-header">
            <h1>Welcome to BrainBuddy</h1>
            <p>Please sign in to continue your learning adventure</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && (
              <div className="error-alert">
                {error}
              </div>
            )}

            <div
              className={`form-field ${
                isEmailFocused || email ? "active" : ""
              } ${!isEmailValid && email ? "invalid" : ""}`}
            >
              <input
                type="email"
                id="email"
                value={email}
                onChange={handleEmailChange}
                onFocus={() => setIsEmailFocused(true)}
                onBlur={() => setIsEmailFocused(false)}
                required
              />
              <label htmlFor="email">Email Address</label>
              {!isEmailValid && email && (
                <span className="error-message">
                  Please enter a valid email
                </span>
              )}
            </div>

            <div
              className={`form-field ${
                isPasswordFocused || password ? "active" : ""
              }`}
            >
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                required
              />
              <label htmlFor="password">Password</label>
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                <span className="checkmark"></span>
                Remember me
              </label>

              <a href="#" className="forgot-password">
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={
                loading || (isFormSubmitted && (!email || !password || !isEmailValid))
              }
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="signup-prompt">
            Don't have an account? <a href="/signup">Sign up</a>
          </p>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-family: 'Inter', sans-serif;
        }

        .login-container.dark {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        }

        .particles-canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }

        .theme-toggle {
          position: absolute;
          top: 20px;
          right: 20px;
          z-index: 10;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          color: white;
        }

        .theme-toggle:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.1);
        }

        .login-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          max-width: 400px;
          width: 90%;
          z-index: 2;
          position: relative;
        }

        .dark .login-card {
          background: rgba(30, 30, 30, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
        }

        .login-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .login-header h1 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 8px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .dark .login-header h1 {
          background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .login-header p {
          color: #666;
          font-size: 0.9rem;
        }

        .dark .login-header p {
          color: #ccc;
        }

        .form-field {
          position: relative;
          margin-bottom: 20px;
        }

        .form-field input {
          width: 100%;
          padding: 15px 20px;
          border: 2px solid #e1e5e9;
          border-radius: 10px;
          font-size: 1rem;
          background: transparent;
          transition: all 0.3s ease;
          outline: none;
        }

        .form-field.active input,
        .form-field input:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-field.invalid input {
          border-color: #e74c3c;
        }

        .form-field label {
          position: absolute;
          left: 20px;
          top: 50%;
          transform: translateY(-50%);
          color: #999;
          transition: all 0.3s ease;
          pointer-events: none;
          font-size: 1rem;
        }

        .form-field.active label,
        .form-field input:focus + label {
          top: 0;
          left: 15px;
          font-size: 0.8rem;
          color: #667eea;
          background: white;
          padding: 0 5px;
        }

        .dark .form-field label {
          color: #ccc;
        }

        .dark .form-field.active label,
        .dark .form-field input:focus + label {
          background: #1a1a2e;
          color: #a8edea;
        }

        .toggle-password {
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #999;
          cursor: pointer;
          padding: 5px;
        }

        .toggle-password:hover {
          color: #667eea;
        }

        .error-message {
          color: #e74c3c;
          font-size: 0.8rem;
          margin-top: 5px;
          display: block;
        }

        .error-alert {
          background: #fee;
          border: 1px solid #fcc;
          color: #c33;
          padding: 10px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 0.9rem;
        }

        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .remember-me {
          display: flex;
          align-items: center;
          cursor: pointer;
          font-size: 0.9rem;
          color: #666;
        }

        .dark .remember-me {
          color: #ccc;
        }

        .remember-me input[type="checkbox"] {
          display: none;
        }

        .checkmark {
          width: 18px;
          height: 18px;
          border: 2px solid #ddd;
          border-radius: 4px;
          margin-right: 8px;
          position: relative;
          transition: all 0.3s ease;
        }

        .remember-me input[type="checkbox"]:checked + .checkmark {
          background: #667eea;
          border-color: #667eea;
        }

        .remember-me input[type="checkbox"]:checked + .checkmark::after {
          content: '✓';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 12px;
        }

        .forgot-password {
          color: #667eea;
          text-decoration: none;
          font-size: 0.9rem;
        }

        .forgot-password:hover {
          text-decoration: underline;
        }

        .login-button {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 20px;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }

        .login-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .signup-prompt {
          text-align: center;
          color: #666;
          font-size: 0.9rem;
        }

        .dark .signup-prompt {
          color: #ccc;
        }

        .signup-prompt a {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
        }

        .signup-prompt a:hover {
          text-decoration: underline;
        }

        .form-success {
          animation: successPulse 0.5s ease-in-out;
        }

        @keyframes successPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); }
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 30px 20px;
            margin: 20px;
          }

          .login-header h1 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AnimatedSignIn;
