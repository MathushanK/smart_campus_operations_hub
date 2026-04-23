import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { OAUTH_LOGIN_URL } from "../config/runtime";
import { getDashboardPath } from "../utils/auth";

function Login() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const errorMessage = new URLSearchParams(location.search).get("error");

  useEffect(() => {
    if (!loading && user) {
      navigate(getDashboardPath(user.role), { replace: true });
    }
  }, [loading, navigate, user]);

  useEffect(() => {
    if (errorMessage) {
      setOpen(true);
    }
  }, [errorMessage]);

  const handleLogin = () => {
    window.location.href = OAUTH_LOGIN_URL;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-50 relative overflow-hidden">
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-10 w-96 h-96 bg-indigo-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-0 right-10 w-96 h-96 bg-blue-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-purple-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center px-6 md:px-12 py-6">
        <div className="flex items-center space-x-2">
          <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            Campus<span className="text-gray-900">Flow</span>
          </div>
        </div>

        <div className="hidden lg:flex items-center space-x-8">
          <a href="#features" className="text-gray-600 hover:text-gray-900 transition duration-300 font-medium">Features</a>
          <a href="#benefits" className="text-gray-600 hover:text-gray-900 transition duration-300 font-medium">Benefits</a>
          <a href="#contact" className="text-gray-600 hover:text-gray-900 transition duration-300 font-medium">Contact</a>
        </div>

        <button
          onClick={handleLogin}
          className="relative px-6 py-2.5 font-semibold text-white rounded-lg overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:from-indigo-700 group-hover:to-purple-700 transition duration-300"></div>
          <span className="relative flex items-center space-x-2">
            <span>Sign In</span>
            <svg className="w-4 h-4 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </button>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <div className="inline-block">
                <span className="px-4 py-2 bg-indigo-100/50 backdrop-blur-md border border-indigo-200 rounded-full text-sm font-semibold text-indigo-700">
                  ✨ Smart Campus Operating System
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                Manage Your Campus Like Never Before
              </h1>

              <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-lg">
                Streamline resource bookings, facility management, and campus operations with our intelligent, all-in-one platform. Designed for modern educational institutions.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8">
              <button
                onClick={handleLogin}
                className="group relative px-8 py-4 font-bold text-white rounded-xl overflow-hidden transition duration-300 transform hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 group-hover:from-indigo-700 group-hover:via-purple-700 group-hover:to-blue-700 transition duration-300"></div>
                <span className="relative flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Get Started Now</span>
                </span>
              </button>

              <button
                onClick={() => window.location.href = "#features"}
                className="group px-8 py-4 font-bold text-gray-900 border-2 border-gray-300 hover:border-gray-400 rounded-xl transition duration-300 backdrop-blur-md bg-white/50 hover:bg-white/80"
              >
                <span className="flex items-center justify-center space-x-2">
                  <span>Learn More</span>
                  <svg className="w-5 h-5 group-hover:translate-y-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </span>
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex gap-8 pt-8">
              <div className="space-y-1">
                <p className="text-3xl font-bold text-gray-900">500+</p>
                <p className="text-gray-600 font-medium">Active Users</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-gray-900">50+</p>
                <p className="text-gray-600 font-medium">Institutions</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-gray-900">99.9%</p>
                <p className="text-gray-600 font-medium">Uptime</p>
              </div>
            </div>
          </div>

          {/* Right Illustration - Professional */}
          <div className="relative hidden md:block">
            <div className="relative w-full h-96 md:h-full flex items-center justify-center">
              {/* Gradient Circle - Subtle Background */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute w-full h-full rounded-full bg-gradient-to-br from-indigo-300/20 via-purple-300/10 to-transparent blur-3xl"></div>
              </div>

              {/* Info Section */}
              <div className="relative space-y-8">
                <div className="bg-white/60 backdrop-blur-lg border border-white/80 rounded-2xl p-8 shadow-xl max-w-sm">
                  <h3 className="text-gray-900 font-bold text-lg mb-6">Why Choose CampusFlow?</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700 text-sm">Real-time resource tracking</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700 text-sm">Smart booking automation</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700 text-sm">24/7 instant notifications</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700 text-sm">Enterprise-grade security</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Powerful Features
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Everything you need to manage campus operations efficiently
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: "📦",
              title: "Resource Management",
              description: "Organize and track all campus resources with ease. Real-time availability and capacity management."
            },
            {
              icon: "📅",
              title: "Smart Booking",
              description: "Intuitive booking system with conflict detection and automated approvals across your campus."
            },
            {
              icon: "🔔",
              title: "Notifications",
              description: "Real-time alerts and notifications keep everyone informed about bookings and updates."
            },
            {
              icon: "👥",
              title: "User Management",
              description: "Role-based access control with admin, technician, and user levels for security."
            },
            {
              icon: "📊",
              title: "Analytics",
              description: "Comprehensive dashboards showing resource utilization and booking trends."
            },
            {
              icon: "🔐",
              title: "Secure & Reliable",
              description: "Enterprise-grade security with OAuth2 authentication and 99.9% uptime guarantee."
            }
          ].map((feature, idx) => (
            <div
              key={idx}
              className="group relative p-8 bg-white/40 backdrop-blur-md border border-white/60 hover:border-indigo-300 rounded-2xl transition duration-300 hover:translate-y-[-8px] hover:bg-white/60 hover:shadow-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/10 group-hover:to-purple-500/10 rounded-2xl transition duration-300"></div>
              
              <div className="relative space-y-4">
                <p className="text-4xl">{feature.icon}</p>
                <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                <p className="text-gray-700 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Error Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-8 shadow-xl animate-fade-in">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-red-100 border border-red-300 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0-12a9 9 0 110 18 9 9 0 010-18z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Login Error</h3>
            </div>

            <p className="text-gray-700 mb-6">
              {errorMessage || "An error occurred during login. Please try again."}
            </p>

            <button
              onClick={() => setOpen(false)}
              className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-lg transition duration-300"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}

export default Login;
