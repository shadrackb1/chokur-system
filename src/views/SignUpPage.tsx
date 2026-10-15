import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const SignUpPage: React.FC = () => {
  const { signUp, loading, isOnline } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'admin' as 'admin' | 'teacher',
    schoolName: '',
    schoolMotto: '',
    schoolAddress: '',
    schoolPhone: '',
    academicYear: new Date().getFullYear().toString(),
    term: 'Term 1',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    const { error: authError } = await signUp(
      formData.email,
      formData.password,
      formData.fullName,
      formData.role,
      {
        name: formData.schoolName,
        motto: formData.schoolMotto,
        postal_address: formData.schoolAddress,
        contact_phone_email: formData.schoolPhone,
        academic_year: formData.academicYear,
        term: formData.term,
      }
    );

    if (authError) {
      setError(authError.message);
      setIsLoading(false);
    } else {
      navigate('/');
    }
  };

  if (!isOnline) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FEF9EF] px-4 py-12">
        <div className="w-full max-w-2xl bg-white border border-[#DDD6C7] p-8 rounded">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[#111111]">Chokur System</h1>
            <p className="text-[#5F5E5E] mt-1">KCSE Academic Grading Ledger</p>
          </div>
          <div className="bg-[#FEF3E2] border border-[#C2410C] rounded p-4 mb-6">
            <p className="text-sm text-[#C2410C] text-center">
              <strong>Offline Mode:</strong> Online registration requires Supabase configuration.
              <br />Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-[#C2410C] text-[#FEF9EF] py-3 rounded font-semibold hover:opacity-95 transition-opacity"
          >
            Continue Offline
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FEF9EF] px-4 py-12">
      <div className="w-full max-w-2xl bg-white border border-[#DDD6C7] p-8 rounded overflow-y-auto max-h-[90vh]">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#111111]">Register School</h1>
          <p className="text-[#5F5E5E] mt-1">Create your Chokur account and school profile</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[#FEF3E2] border border-[#C2410C] rounded text-sm text-[#C2410C]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <fieldset className="border border-[#DDD6C7] rounded p-4 space-y-4">
            <legend className="font-semibold text-[#111111] px-2">Account Details</legend>
            <div>
              <label className="block text-sm font-medium text-[#111111] mb-1">Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={e => handleChange('fullName', e.target.value)}
                required
                className="w-full px-4 py-2 border border-[#DDD6C7] rounded focus:outline-none focus:border-[#C2410C]"
                placeholder="John Kamau"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111111] mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
                required
                className="w-full px-4 py-2 border border-[#DDD6C7] rounded focus:outline-none focus:border-[#C2410C]"
                placeholder="principal@school.ac.ke"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111111] mb-1">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={e => handleChange('password', e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-2 border border-[#DDD6C7] rounded focus:outline-none focus:border-[#C2410C]"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111111] mb-1">Confirm Password</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={e => handleChange('confirmPassword', e.target.value)}
                required
                className="w-full px-4 py-2 border border-[#DDD6C7] rounded focus:outline-none focus:border-[#C2410C]"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111111] mb-1">Role</label>
              <select
                value={formData.role}
                onChange={e => handleChange('role', e.target.value)}
                className="w-full px-4 py-2 border border-[#DDD6C7] rounded focus:outline-none focus:border-[#C2410C]"
              >
                <option value="admin">School Administrator (creates new school)</option>
                <option value="teacher">Teacher (joins existing school)</option>
              </select>
            </div>
          </fieldset>

          <fieldset className="border border-[#DDD6C7] rounded p-4 space-y-4">
            <legend className="font-semibold text-[#111111] px-2">School Information</legend>
            <div>
              <label className="block text-sm font-medium text-[#111111] mb-1">School Name</label>
              <input
                type="text"
                value={formData.schoolName}
                onChange={e => handleChange('schoolName', e.target.value)}
                required
                className="w-full px-4 py-2 border border-[#DDD6C7] rounded focus:outline-none focus:border-[#C2410C]"
                placeholder="St. Mary's Secondary School"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111111] mb-1">School Motto</label>
              <input
                type="text"
                value={formData.schoolMotto}
                onChange={e => handleChange('schoolMotto', e.target.value)}
                className="w-full px-4 py-2 border border-[#DDD6C7] rounded focus:outline-none focus:border-[#C2410C]"
                placeholder="Knowledge is Power"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111111] mb-1">Postal Address</label>
              <input
                type="text"
                value={formData.schoolAddress}
                onChange={e => handleChange('schoolAddress', e.target.value)}
                className="w-full px-4 py-2 border border-[#DDD6C7] rounded focus:outline-none focus:border-[#C2410C]"
                placeholder="P.O. Box 123, Nairobi"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111111] mb-1">Contact Phone/Email</label>
              <input
                type="text"
                value={formData.schoolPhone}
                onChange={e => handleChange('schoolPhone', e.target.value)}
                className="w-full px-4 py-2 border border-[#DDD6C7] rounded focus:outline-none focus:border-[#C2410C]"
                placeholder="+254 700 123456 / info@school.ac.ke"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#111111] mb-1">Academic Year</label>
                <input
                  type="text"
                  value={formData.academicYear}
                  onChange={e => handleChange('academicYear', e.target.value)}
                  className="w-full px-4 py-2 border border-[#DDD6C7] rounded focus:outline-none focus:border-[#C2410C]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#111111] mb-1">Current Term</label>
                <select
                  value={formData.term}
                  onChange={e => handleChange('term', e.target.value)}
                  className="w-full px-4 py-2 border border-[#DDD6C7] rounded focus:outline-none focus:border-[#C2410C]"
                >
                  <option value="Term 1">Term 1</option>
                  <option value="Term 2">Term 2</option>
                  <option value="Term 3">Term 3</option>
                </select>
              </div>
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={isLoading || loading}
            className="w-full bg-[#C2410C] text-[#FEF9EF] py-3 rounded font-semibold hover:opacity-95 transition-opacity disabled:opacity-50"
          >
            {isLoading ? 'Creating Account...' : 'Create Account & School'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#5F5E5E]">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-[#C2410C] font-medium hover:underline"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};