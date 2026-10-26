import { useState } from 'react';
import { AlertCircle, Eye, EyeOff, GraduationCap, HeartHandshake, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/lib/supabase';

export function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [school, setSchool] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isSignup) {
        const { error } = await signUp(
          email.trim(),
          password,
          fullName.trim(),
          birthdate,
          school.trim(),
          role,
        );
        if (error) setError(error);
      } else {
        const { error } = await signIn(email.trim(), password);
        if (error) setError(error);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-brand to-brand-700 px-5 py-8">
      {/* Brand */}
      <div className="mb-5 flex flex-col items-center text-center text-white">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
          <GraduationCap className="h-8 w-8" />
        </div>
        <h1 className="mt-3 text-xl font-bold">Scholóur</h1>
        <p className="mt-0.5 text-xs text-brand-100">
          No Student Left Behind by Financial Barriers
        </p>
      </div>

      {/* Compact card */}
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl animate-scale-in">
        {error && (
          <div className="mb-3 flex items-start gap-2 rounded-lg border border-gold-200 bg-gold-50 p-2.5 text-sm text-gold-700">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {isSignup && (
            <>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`flex min-w-0 items-center justify-center gap-1.5 rounded-xl border-2 px-1 py-2 text-xs font-semibold transition-all ${
                    role === 'student'
                      ? 'border-brand bg-brand-50 text-brand'
                      : 'border-base-200 text-brand-500 hover:border-brand-200'
                  }`}
                >
                  <GraduationCap className="h-3.5 w-3.5 flex-shrink-0" />
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('donor')}
                  className={`flex min-w-0 items-center justify-center gap-1.5 rounded-xl border-2 px-1 py-2 text-xs font-semibold transition-all ${
                    role === 'donor'
                      ? 'border-gold bg-gold-50 text-gold-700'
                      : 'border-base-200 text-brand-500 hover:border-gold-200'
                  }`}
                >
                  <HeartHandshake className="h-3.5 w-3.5 flex-shrink-0" />
                  Donor
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`flex min-w-0 items-center justify-center gap-1.5 rounded-xl border-2 px-1 py-2 text-xs font-semibold transition-all ${
                    role === 'admin'
                      ? 'border-teal bg-teal-50 text-teal-700'
                      : 'border-base-200 text-brand-500 hover:border-teal-200'
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0" />
                  Admin
                </button>
              </div>
              <Field label="Full name">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Juan Dela Cruz"
                  className="input-field"
                  required
                />
              </Field>
              <Field label="Birthdate">
                <input
                  type="date"
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                  className="input-field"
                  required
                />
              </Field>
              <Field label={role === 'student' ? 'School' : 'Organization / Institution'}>
                <input
                  type="text"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder={role === 'student' ? 'e.g. Naga College Foundation' : 'e.g. CHED Region V'}
                  className="input-field"
                  required
                />
              </Field>
            </>
          )}
          <Field label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input-field"
              required
            />
          </Field>
          <Field label="Password">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="input-field pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-brand-400 hover:text-brand"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </Field>

          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 text-sm">
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isSignup ? (
              'Create account'
            ) : (
              'Log in'
            )}
          </button>
        </form>

        <p className="mt-3 text-center text-xs text-brand-400">
          {isSignup ? 'Already registered? ' : "Don't have an account? "}
          <button
            type="button"
            onClick={() => {
              setIsSignup((v) => !v);
              setError(null);
            }}
            className="font-semibold text-brand hover:underline"
          >
            {isSignup ? 'Log in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label-field">{label}</label>
      {children}
    </div>
  );
}
