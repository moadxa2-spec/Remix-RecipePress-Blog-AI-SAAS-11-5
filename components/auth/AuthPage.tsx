import React, { useState } from 'react';
import type { View, User } from '../../types';
import { Icons } from '../../constants';
import { verify2FA } from '../../services/authService';
import { Spinner } from '../Spinner';

interface AuthPageProps {
  mode: 'login' | 'signup';
  setView: (view: View) => void;
  onLogin: (email?: string, password?: string, rememberMe?: boolean) => Promise<User & { twoFactorRequired?: boolean }>;
  onSignup: (name?: string, email?: string, password?: string, licenseKey?: string, referralCode?: string) => void;
  onGoogleLogin: () => void;
  onLoginSuccess: (user: User) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ mode, setView, onLogin, onSignup, onGoogleLogin, onLoginSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pending2FAUser, setPending2FAUser] = useState<User | null>(null);

  const isLogin = mode === 'login';

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
        const result = await onLogin(email, password, rememberMe);
        if (result.twoFactorRequired) {
            setPending2FAUser(result);
        } else {
            onLoginSuccess(result);
        }
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
        setIsLoading(false);
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      if (!pending2FAUser || !twoFactorCode) return;
      setIsLoading(true);

      try {
          const user = await verify2FA(pending2FAUser.id, twoFactorCode, rememberMe);
          onLoginSuccess(user);
      } catch (err) {
          setError(err instanceof Error ? err.message : '2FA verification failed.');
      } finally {
          setIsLoading(false);
      }
  }

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password) {
        setError('Please fill in all required fields.');
        return;
    }
    setIsLoading(true);
    try {
      onSignup(name, email, password, licenseKey.trim(), referralCode.trim());
    } catch(err) {
       setError(err instanceof Error ? err.message : 'Sign up failed.');
    } finally {
      setIsLoading(false);
    }
  };

  if (pending2FAUser) {
      return (
         <div className="min-h-screen flex items-center justify-center bg-slate-100 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Two-Factor Authentication
              </h2>
               <p className="mt-2 text-center text-sm text-gray-600">
                Enter the code from your authenticator app for {pending2FAUser.email}.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200/80">
                <form className="mt-6 space-y-6" onSubmit={handle2FASubmit}>
                    {error && <p className="text-center text-sm text-red-600">{error}</p>}
                     <div>
                        <label htmlFor="2fa-code" className="sr-only">Verification Code</label>
                        <input id="2fa-code" name="2fa-code" type="text" inputMode="numeric" pattern="[0-9]*" autoComplete="one-time-code" value={twoFactorCode} onChange={e => setTwoFactorCode(e.target.value)} required className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm" placeholder="6-digit code" />
                    </div>
                    <div>
                        <button type="submit" disabled={isLoading} className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-slate-400">
                            {isLoading ? <Spinner size="h-5 w-5" /> : 'Verify'}
                        </button>
                    </div>
                </form>
             </div>
          </div>
        </div>
      )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <button onClick={() => setView(isLogin ? 'signup' : 'login')} className="font-medium text-teal-600 hover:text-teal-500">
              {isLogin ? 'create an account' : 'sign in to your existing account'}
            </button>
          </p>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200/80">
            <button
                type="button"
                onClick={onGoogleLogin}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
                <svg className="w-5 h-5" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
                    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path>
                    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path>
                    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 36.417 44 30.853 44 24c0-1.341-.138-2.65-.389-3.917z"></path>
                </svg>
                <span className="ml-2">{isLogin ? 'Sign in' : 'Sign up'} with Google</span>
            </button>

            <div className="mt-6 relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
            </div>

            <form className="mt-6 space-y-6" onSubmit={isLogin ? handleLoginSubmit : handleSignupSubmit}>
                {error && <p className="text-center text-sm text-red-600">{error}</p>}
                {!isLogin && (
                    <div>
                        <label htmlFor="name" className="sr-only">Full Name</label>
                        <input id="name" name="name" type="text" value={name} onChange={e => setName(e.target.value)} required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm" placeholder="Full Name" />
                    </div>
                )}
                <div>
                    <label htmlFor="email-address" className="sr-only">Email address</label>
                    <input id="email-address" name="email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm ${isLogin ? 'rounded-t-md' : ''} ${!isLogin ? '' : 'rounded-b-md'}`} placeholder="Email address" />
                </div>
                <div>
                    <label htmlFor="password" className="sr-only">Password</label>
                    <input id="password" name="password" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm ${isLogin ? 'rounded-b-md' : ''}`} placeholder="Password" />
                </div>
                 {isLogin && (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input id="remember-me" name="remember-me" type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded" />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                Remember me
                            </label>
                        </div>
                    </div>
                )}
                 {!isLogin && (
                    <>
                        <div>
                            <label htmlFor="license-key" className="sr-only">License Key (Optional)</label>
                            <input id="license-key" name="licenseKey" type="text" value={licenseKey} onChange={e => setLicenseKey(e.target.value)} className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm" placeholder="License Key (Optional)" />
                        </div>
                        <div>
                            <label htmlFor="referral-code" className="sr-only">Referral Code (Optional)</label>
                            <input id="referral-code" name="referralCode" type="text" value={referralCode} onChange={e => setReferralCode(e.target.value)} className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm" placeholder="Referral Code (Optional)" />
                        </div>
                    </>
                )}


                <div>
                    <button type="submit" disabled={isLoading} className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-slate-400">
                        {isLoading ? <Spinner size="h-5 w-5" /> : (isLogin ? 'Sign in' : 'Create Account')}
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};