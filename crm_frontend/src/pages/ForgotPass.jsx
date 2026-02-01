import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendLink = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await axiosInstance.post('/employees/auth/request-reset/', { email });

      // Success case
      setMessage('✅ Reset link sent to your email!');
      toast.success('Reset link sent to your email!', {
        position: 'top-center',
        autoClose: 3000,
        theme: 'colored',
      });
    } catch (error) {
      if (error.response && error.response.status === 400) {
        const detail = error.response.data?.detail || '';

        // Handle cases where backend sends 400 even when email is sent
        if (detail.includes('password reset e-mail has been sent')) {
          setMessage('✅ Reset link sent to your email!');
          toast.success('Reset link sent to your email!', {
            position: 'top-center',
            autoClose: 3000,
            theme: 'colored',
          });
        } else {
          setMessage('❌ ' + detail);
          toast.error(detail || 'Error sending reset link', {
            position: 'top-center',
            autoClose: 3000,
            theme: 'dark',
          });
        }
      } else {
        setMessage('❌ Network or server error. Please try again later.');
        toast.error('Network or server error. Please try again later.', {
          position: 'top-center',
          autoClose: 3000,
          theme: 'dark',
        });
      }
      console.error('Error sending reset link:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/');
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b] overflow-hidden">
      {/* Enhanced wave background */}
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
        <div className="w-full max-w-sm">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-blue-500/20">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-500/20 mb-4 border-4 border-indigo-600 shadow-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-blue-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="absolute -inset-2 rounded-full border-2 border-blue-300/30 animate-ping-slow pointer-events-none"></div>
                </div>
                <h2 className="text-xl font-bold text-white">
                  Forgot Password
                </h2>
                <p className="text-xs text-blue-100/80 mt-1">
                  Enter your email to receive a reset link
                </p>
              </div>

              {message && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${message.includes('✅') ? 'bg-green-500/20 text-green-100' : 'bg-red-500/20 text-red-100'}`}>
                  {message}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                      placeholder="Enter your registered email"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="h-5 w-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
                      </svg>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSendLink}
                  disabled={!email || loading}
                  className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center relative overflow-hidden ${
                    loading
                      ? 'bg-blue-700/80 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg hover:shadow-blue-500/30'
                  } ${!email ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>

                <button
                  onClick={handleBackToLogin}
                  className="w-full py-2.5 px-4 border border-white/20 rounded-lg text-sm font-medium text-white bg-transparent hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
                >
                  Back to Login
                </button>
              </div>
            </div>
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

export default ForgotPassword;