import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post('https://genhub-crm.onrender.com/api/admin/login/', {
        email,
        password,
      });
      const { access_token, refresh_token } = response.data;
      localStorage.setItem('access', access_token);
      localStorage.setItem('refresh', refresh_token);

      toast.success('Login Successful 🎉', {
        position: 'top-center',
        autoClose: 1500,
        theme: 'colored',
      });
      setTimeout(() => navigate('/admin/dashboard'), 1600);
    } catch (err) {
      toast.error(
        err.response?.status === 401
          ? 'Invalid email or password ❌'
          : 'Server error. Try again later.',
        {
          position: 'top-center',
          autoClose: 2000,
          theme: 'dark',
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  const goToEmployeeLogin = () => {
    navigate('/employees/login');
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b] overflow-hidden">
      {/* Enhanced full-page wave background */}
      <div className="absolute inset-0 z-0">
        {/* Primary wave */}
        <div className="absolute bottom-0 left-0 w-full h-1/3 opacity-30">
          <svg 
            viewBox="0 0 1440 320" 
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            <path 
              fill="#3b82f6"
              d="M0,192L60,181.3C120,171,240,149,360,154.7C480,160,600,192,720,192C840,192,960,160,1080,149.3C1200,139,1320,149,1380,154.7L1440,160L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
            ></path>
          </svg>
        </div>

        {/* Secondary wave */}
        <div className="absolute bottom-0 left-0 w-full h-1/2 opacity-20">
          <svg 
            viewBox="0 0 1440 320" 
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            <path 
              fill="#3b82f6"
              d="M0,256L48,261.3C96,267,192,277,288,266.7C384,256,480,224,576,213.3C672,203,768,213,864,229.3C960,245,1056,267,1152,277.3C1248,288,1344,288,1392,288L1440,288L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
        </div>

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-blue-400/20"
            style={{
              width: `${Math.random() * 8 + 4}px`,
              height: `${Math.random() * 8 + 4}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 20 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      <ToastContainer />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-sm"> {/* Reduced from max-w-md */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-indigo-500/20">
            <div className="p-6"> {/* Reduced from p-8 */}
              <div className="text-center mb-6"> {/* Reduced from mb-8 */}
                <div className="relative inline-block">
                  <img
                    src="/logo.jpeg"
                    alt="Logo"
                    className="w-16 h-16 mx-auto rounded-full border-4 border-indigo-600 shadow-lg" 
                  />
                  <div className="absolute -inset-2 rounded-full border-2 border-white/20 animate-ping-slow pointer-events-none"></div>
                </div>
                <h2 className="text-xl font-bold mt-4 text-white"> {/* Reduced size and margin */}
                  Admin Login
                </h2>
                <p className="text-xs text-white/80 mt-1"> {/* Smaller text */}
                  Sign in to your dashboard
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4"> {/* Reduced spacing */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-2 rounded-lg bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-white/20 transition-all duration-200" 
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="h-5 w-5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-4 py-2 rounded-lg bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-white/20 transition-all duration-200" 
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="h-5 w-5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-white/30 rounded bg-white/10"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-white/70">
                      Remember me
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs font-medium text-indigo-300 hover:text-indigo-200 transition-colors duration-200" 
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center relative overflow-hidden ${
                    isLoading
                      ? 'bg-indigo-700 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> {/* Smaller spinner */}
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Authenticating...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              <div className="mt-4 text-center"> {/* Reduced margin */}
                <button
                  onClick={goToEmployeeLogin}
                  className="text-xs font-medium bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors duration-200 inline-flex items-center text-white" 
                >
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"> {/* Smaller icon */}
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Employee Login
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center text-xs text-white/50"> {/* Smaller footer */}
            <p>© {new Date().getFullYear()} LivePresence. All rights reserved.</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(-100vh) translateX(20px);
            opacity: 0;
          }
        }
        @keyframes ping-slow {
          0% {
            transform: scale(0.95);
            opacity: 0.8;
          }
          70% {
            transform: scale(1.2);
            opacity: 0;
          }
          100% {
            transform: scale(0.95);
            opacity: 0;
          }
        }
        .animate-ping-slow {
          animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default Login;