import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEnvelope } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../layouts/AuthLayout';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      await resetPassword(email);
      setMessage('Check your inbox for further instructions');
    } catch (error) {
      setError('Failed to reset password');
    }

    setLoading(false);
  };

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your email to reset your password"
      imageSrc="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-100 text-red-700 p-3 rounded-lg text-sm"
          >
            {error}
          </motion.div>
        )}

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-100 text-green-700 p-3 rounded-lg text-sm"
          >
            {message}
          </motion.div>
        )}

        <div>
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Email address"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Reset Password'}
        </button>

        <div className="flex justify-between items-center text-sm">
          <Link
            to="/login"
            className="text-primary hover:text-primary/80 font-medium"
          >
            Back to Login
          </Link>
          <Link
            to="/signup"
            className="text-primary hover:text-primary/80 font-medium"
          >
            Create Account
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword; 