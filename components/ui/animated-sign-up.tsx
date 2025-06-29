"use client";

import React, { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Sun,
  Moon,
  User,
  GraduationCap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";

const AnimatedSignUp: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const { signInWithGoogle, signUpWithEmail } = useFirebaseAuth();
  const router = useRouter();

  // Email validation
  const validateEmail = (email: string) => {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  // Handle email change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, email: e.target.value }));
    if (e.target.value) {
      setIsEmailValid(validateEmail(e.target.value));
    } else {
      setIsEmailValid(true);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) return "Full name is required";
    if (!formData.email.trim()) return "Email is required";
    if (!validateEmail(formData.email)) return "Please enter a valid email";
    if (formData.password.length < 6) return "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword) return "Passwords do not match";
    if (!agreeToTerms) return "Please agree to the terms and conditions";
    return null;
  };

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError("");
      await signInWithGoogle();
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google");
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsFormSubmitted(true);
    setLoading(true);
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      await signUpWithEmail(formData.email, formData.password, formData.fullName);
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
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

  if (success) {
    return (
      <div className={`signup-container ${isDarkMode ? "dark" : "light"}`}>
        <canvas id="particles" className="particles-canvas"></canvas>
        <div className="success-card">
          <div className="success-icon">✓</div>
          <h2>Welcome to BrainBuddy!</h2>
          <p>Your account has been created successfully. You'll be redirected to your dashboard shortly.</p>
          <div className="loading-spinner"></div>
        </div>
        <style jsx>{`
          .signup-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            font-family: 'Inter', sans-serif;
          }

          .dark .signup-container {
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

          .success-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            padding: 40px;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            max-width: 400px;
            width: 90%;
            z-index: 2;
            position: relative;
          }

          .dark .success-card {
            background: rgba(30, 30, 30, 0.95);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: white;
          }

          .success-icon {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            color: white;
            margin: 0 auto 20px;
          }

          .success-card h2 {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 10px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .dark .success-card h2 {
            background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .success-card p {
            color: #666;
            margin-bottom: 20px;
          }

          .dark .success-card p {
            color: #ccc;
          }

          .loading-spinner {
            width: 30px;
            height: 30px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={`signup-container ${isDarkMode ? "dark" : "light"}`}>
      <canvas id="particles" className="particles-canvas"></canvas>

      <div className="theme-toggle" onClick={toggleDarkMode}>
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </div>

      <div className="signup-card">
        <div className="signup-card-inner">
          <div className="signup-header">
            <h1>Join BrainBuddy</h1>
            <p>Start your learning adventure today!</p>
          </div>

          <form className="signup-form" onSubmit={handleSubmit}>
            {error && (
              <div className="error-alert">
                {error}
              </div>
            )}

            <div
              className={`form-field ${
                isNameFocused || formData.fullName ? "active" : ""
              }`}
            >
              <input
                type="text"
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                onFocus={() => setIsNameFocused(true)}
                onBlur={() => setIsNameFocused(false)}
                required
              />
              <label htmlFor="fullName">Full Name</label>
            </div>

            <div
              className={`form-field ${
                isEmailFocused || formData.email ? "active" : ""
              } ${!isEmailValid && formData.email ? "invalid" : ""}`}
            >
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleEmailChange}
                onFocus={() => setIsEmailFocused(true)}
                onBlur={() => setIsEmailFocused(false)}
                required
              />
              <label htmlFor="email">Email Address</label>
              {!isEmailValid && formData.email && (
                <span className="error-message">
                  Please enter a valid email
                </span>
              )}
            </div>

            <div
              className={`form-field ${
                isPasswordFocused || formData.password ? "active" : ""
              }`}
            >
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
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

            <div
              className={`form-field ${
                isConfirmPasswordFocused || formData.confirmPassword ? "active" : ""
              }`}
            >
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                onFocus={() => setIsConfirmPasswordFocused(true)}
                onBlur={() => setIsConfirmPasswordFocused(false)}
                required
              />
              <label htmlFor="confirmPassword">Confirm Password</label>
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={() => setAgreeToTerms(!agreeToTerms)}
                />
                <span className="checkmark"></span>
                I agree to the terms and conditions
              </label>
            </div>

            <button
              type="submit"
              className="signup-button"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="separator">
            <span>or continue with</span>
          </div>

          <button
            type="button"
            className="google-signup-button"
            onClick={handleGoogleSignIn}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <p className="login-prompt">
            Already have an account? <a href="/login">Sign in</a>
          </p>
        </div>
      </div>

      <style jsx>{`
        .signup-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-family: 'Inter', sans-serif;
        }

        .signup-container.dark {
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

        .signup-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          max-width: 450px;
          width: 90%;
          z-index: 2;
          position: relative;
          max-height: 90vh;
          overflow-y: auto;
        }

        .dark .signup-card {
          background: rgba(30, 30, 30, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
        }

        .signup-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .signup-header h1 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 8px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .dark .signup-header h1 {
          background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .signup-header p {
          color: #666;
          font-size: 0.9rem;
        }

        .dark .signup-header p {
          color: #ccc;
        }

        .form-field {
          position: relative;
          margin-bottom: 20px;
        }

        .form-field input,
        .form-field select {
          width: 100%;
          padding: 15px 20px;
          border: 2px solid #e1e5e9;
          border-radius: 10px;
          font-size: 1rem;
          background: transparent;
          transition: all 0.3s ease;
          outline: none;
        }

        .user-type-select {
          color: #666;
        }

        .dark .user-type-select {
          color: #ccc;
        }

        .form-field.active input,
        .form-field input:focus,
        .form-field select:focus {
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

        .signup-button {
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

        .signup-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }

        .signup-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .separator {
          text-align: center;
          margin: 20px 0;
          position: relative;
          z-index: 1;
        }

        .separator::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: #e1e5e9;
          z-index: -1;
        }

        .separator span {
          background: white;
          padding: 0 15px;
          color: #999;
          font-size: 0.9rem;
          position: relative;
          z-index: 2;
        }

        .dark .separator span {
          background: #1a1a2e;
          color: #ccc;
        }

        .google-signup-button {
          width: 100%;
          padding: 15px;
          background: white;
          color: #333;
          border: 2px solid #e1e5e9;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .google-signup-button:hover {
          background: #f8f9fa;
          border-color: #dadce0;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }

        .google-signup-button:active {
          transform: translateY(0);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .dark .google-signup-button {
          background: #2a2a2a;
          border-color: #444;
          color: #ccc;
        }

        .dark .google-signup-button:hover {
          background: #3a3a3a;
          border-color: #555;
        }

        .login-prompt {
          text-align: center;
          color: #666;
          font-size: 0.9rem;
        }

        .dark .login-prompt {
          color: #ccc;
        }

        .login-prompt a {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
        }

        .login-prompt a:hover {
          text-decoration: underline;
        }

        @media (max-width: 480px) {
          .signup-card {
            padding: 30px 20px;
            margin: 20px;
          }

          .signup-header h1 {
            font-size: 1.5rem;
          }

          .google-signup-button {
            padding: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default AnimatedSignUp;
