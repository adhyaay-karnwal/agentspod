'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signUp } from '@/lib/auth';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Handle signup form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);

    try {
      await signUp(email, password);
      router.push('/dashboard'); // Redirect to dashboard after successful signup
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to create account. Please try again.';
      setError(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen font-berkeley text-black overflow-hidden flex items-center justify-center">
      {/* === Radial gradient background === */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,#f0f4ff_0%,#fafafa_40%,#ffffff_70%)]" />
      
      {/* === Animated background elements === */}
      <motion.div
        className="pointer-events-none fixed inset-0 -z-10 bg-[url('/noise.svg')] opacity-20 mix-blend-overlay"
        animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
        transition={{ repeat: Infinity, duration: 60, ease: 'linear' }}
      />
      
      {/* === Floating blobs === */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 top-[-120px] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#b8c3ff] to-[#eaefff] blur-3xl opacity-60 -z-10"
        animate={{ scale: [1, 1.2, 1], rotate: [0, 60, 0] }}
        transition={{ repeat: Infinity, duration: 30, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -right-40 top-20 w-96 h-96 rounded-full bg-gradient-to-tr from-[#e0e7ff] to-white opacity-40 blur-2xl -z-10"
        animate={{ y: [0, -40, 0], x: [0, 20, 0] }}
        transition={{ repeat: Infinity, duration: 18, ease: 'easeInOut' }}
      />

      {/* === Signup Card === */}
      <motion.div
        className="w-full max-w-md px-8 py-12 mx-4 rounded-3xl bg-white/60 backdrop-blur-lg border border-black/10 shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* === Wind Logo === */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <motion.h1
              className="text-3xl font-semibold tracking-tight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Wind
            </motion.h1>
          </Link>
        </div>

        <motion.h2
          className="text-2xl font-medium mb-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Create your account
        </motion.h2>

        {/* === Error Message === */}
        {error && (
          <motion.div
            className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}

        {/* === Signup Form === */}
        <motion.form
          onSubmit={handleSubmit}
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-md border border-black/10 focus:border-black/30 focus:ring-1 focus:ring-black/30 outline-none transition-all bg-white/50"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-md border border-black/10 focus:border-black/30 focus:ring-1 focus:ring-black/30 outline-none transition-all bg-white/50"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-md border border-black/10 focus:border-black/30 focus:ring-1 focus:ring-black/30 outline-none transition-all bg-white/50"
              placeholder="••••••••"
            />
          </div>

          <motion.button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-black text-white rounded-md hover:bg-black/90 transition-colors text-sm font-medium flex items-center justify-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <span className="inline-block h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></span>
            ) : null}
            {isLoading ? 'Creating account...' : 'Sign up'}
          </motion.button>
        </motion.form>

        {/* === Login link === */}
        <motion.div
          className="mt-8 text-center text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          Already have an account?{' '}
          <Link
            href="/auth/login"
            className="text-black font-medium hover:underline"
          >
            Log in
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
