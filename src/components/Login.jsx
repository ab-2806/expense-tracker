import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { LogIn } from 'lucide-react';

function Login() {
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        alert('Login cancelled. Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        alert('Popup blocked. Please allow popups for this site.');
      } else {
        alert('Login failed. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
            <span className="text-4xl">💰</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Expense Tracker
          </h1>
          <p className="text-gray-600">
            Track your expenses together
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleGoogleSignIn}
            className="w-full bg-white border-2 border-gray-200 hover:border-blue-500 text-gray-700 font-semibold py-4 px-6 rounded-xl transition flex items-center justify-center gap-3 shadow-sm hover:shadow-md"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
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
            Sign in with Google
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Quick & Secure</span>
            </div>
          </div>

          <div className="text-center text-sm text-gray-500 space-y-2">
            <p>✓ No password needed</p>
            <p>✓ Stays logged in on this device</p>
            <p>✓ Secure with Google OAuth</p>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            For Ashwin & Pooja's personal use
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
