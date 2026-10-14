import React, { useState } from 'react';
import { Logo } from '../components/brand/Logo';

interface FormState {
  name: string;
  schoolName: string;
  role: string;
  phone: string;
  email: string;
  studentCount: string;
  notes: string;
  honeypot: string;
  consent: boolean;
}

interface FormErrors {
  name?: string;
  schoolName?: string;
  role?: string;
  phone?: string;
  email?: string;
  studentCount?: string;
  consent?: string;
}

const ROLES = [
  'Teacher',
  'Head of subject',
  'Deputy',
  'Headteacher',
  'Other',
];

const KENYAN_PHONE_REGEX = /^(\+254|0)[17]\d{8}$/;
const INTERNATIONAL_PHONE_REGEX = /^\+[1-9]\d{1,14}$/;

function validatePhone(phone: string): boolean {
  return KENYAN_PHONE_REGEX.test(phone) || INTERNATIONAL_PHONE_REGEX.test(phone);
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateForm(state: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!state.name.trim()) errors.name = 'Name is required';
  if (!state.schoolName.trim()) errors.schoolName = 'School name is required';
  if (!state.role) errors.role = 'Role is required';
  if (!state.phone.trim()) {
    errors.phone = 'Phone or WhatsApp number is required';
  } else if (!validatePhone(state.phone)) {
    errors.phone = 'Enter a valid Kenyan (+254 7XX XXX XXX or 07XX XXX XXX) or international number';
  }
  if (!state.email.trim()) {
    errors.email = 'Email is required';
  } else if (!validateEmail(state.email)) {
    errors.email = 'Enter a valid email address';
  }
  if (state.studentCount && (parseInt(state.studentCount) < 1 || parseInt(state.studentCount) > 5000)) {
    errors.studentCount = 'Enter a number between 1 and 5000';
  }
  if (!state.consent) errors.consent = 'You must consent to be contacted';

  return errors;
}

export default function DemoPage() {
  const [formState, setFormState] = useState<FormState>({
    name: '',
    schoolName: '',
    role: '',
    phone: '',
    email: '',
    studentCount: '',
    notes: '',
    honeypot: '',
    consent: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormState(prev => ({ ...prev, [name]: newValue }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot check
    if (formState.honeypot) {
      // Silently succeed but don't actually submit
      setSubmitStatus('success');
      return;
    }

    const validationErrors = validateForm(formState);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitStatus('submitting');
    setErrorMessage('');

    try {
      const demoEndpoint = import.meta.env.VITE_DEMO_ENDPOINT;
      const contactEmail = import.meta.env.VITE_CONTACT_EMAIL;

      if (demoEndpoint) {
        const response = await fetch(demoEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formState,
            honeypot: undefined,
            timestamp: new Date().toISOString(),
            consent: true,
          }),
        });

        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }
      } else if (contactEmail) {
        // Fallback to mailto
        const subject = encodeURIComponent(`Chokur Demo Request: ${formState.name} - ${formState.schoolName}`);
        const body = encodeURIComponent(
          `Name: ${formState.name}\n` +
          `School: ${formState.schoolName}\n` +
          `Role: ${formState.role}\n` +
          `Phone: ${formState.phone}\n` +
          `Email: ${formState.email}\n` +
          `Students: ${formState.studentCount || 'Not specified'}\n` +
          `Notes: ${formState.notes || 'None'}\n` +
          `Consent: Yes\n` +
          `Timestamp: ${new Date().toISOString()}`
        );
        window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
      } else {
        throw new Error('No demo endpoint or contact email configured');
      }

      setSubmitStatus('success');
      setFormState({
        name: '',
        schoolName: '',
        role: '',
        phone: '',
        email: '',
        studentCount: '',
        notes: '',
        honeypot: '',
        consent: false,
      });
    } catch (err) {
      setSubmitStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Failed to submit. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-surface font-body">
      <nav className="fixed top-0 left-0 right-0 z-40 bg-surface-panel/95 backdrop-blur-sm border-b border-hairline">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
          <Logo variant="horizontal" size={32} />
          <a href="/" className="text-body text-secondary hover:text-primary transition-base focus-ring">← Back to Chokur</a>
        </div>
      </nav>

      <main className="pt-24 pb-16 lg:pb-24">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            <header className="mb-12 text-center">
              <Logo variant="horizontal" size={40} className="mb-4" />
              <h1 className="text-h1 text-primary tracking-tight">Request a demo</h1>
              <p className="mt-4 text-body text-secondary max-w-xl mx-auto">
                We'll walk through your actual marks, show you the rankings and report cards, and answer your questions. No commitment.
              </p>
            </header>

            {submitStatus === 'success' ? (
              <div className="bg-surface-panel border border-hairline rounded-sm p-8 text-center" role="status" aria-live="polite">
                <div className="w-12 h-12 border border-primary rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                  <span className="material-symbols-outlined text-[28px]">check</span>
                </div>
                <h2 className="text-h2 text-primary">Request sent</h2>
                <p className="mt-2 text-body text-secondary">
                  We'll be in touch within one business day to schedule your demo.
                </p>
                <a href="/" className="mt-6 inline-block text-body text-brand hover:underline focus-ring">
                  ← Back to home
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-surface-panel border border-hairline rounded-sm p-6 lg:p-8" noValidate>
                {submitStatus === 'error' && (
                  <div className="mb-6 p-4 bg-error-bg border border-error rounded-sm flex items-start gap-3" role="alert" aria-live="assertive">
                    <span className="material-symbols-outlined text-error text-[20px] mt-0.5">error</span>
                    <div>
                      <p className="text-body text-error font-medium">Submission failed</p>
                      <p className="text-body-sm text-secondary mt-1">{errorMessage}</p>
                      <button
                        type="button"
                        onClick={() => setSubmitStatus('idle')}
                        className="mt-2 text-body-sm text-brand hover:underline focus-ring"
                      >
                        Try again
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-label text-primary uppercase tracking-wider mb-1.5">
                      Full name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formState.name}
                      onChange={handleChange}
                      className={`w-full px-3 py-2.5 bg-surface border border-hairline rounded-sm text-body text-primary placeholder:text-tertiary focus:outline-none focus:border-brand focus:ring-0 ${errors.name ? 'border-error' : ''}`}
                      placeholder="Jane Kamau"
                      required
                      autoComplete="name"
                      aria-invalid={errors.name ? 'true' : 'false'}
                      aria-describedby={errors.name ? 'name-error' : undefined}
                      disabled={submitStatus === 'submitting'}
                    />
                    {errors.name && (
                      <p id="name-error" className="mt-1.5 text-body-sm text-error" role="alert">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="schoolName" className="block text-label text-primary uppercase tracking-wider mb-1.5">
                      School name
                    </label>
                    <input
                      type="text"
                      id="schoolName"
                      name="schoolName"
                      value={formState.schoolName}
                      onChange={handleChange}
                      className={`w-full px-3 py-2.5 bg-surface border border-hairline rounded-sm text-body text-primary placeholder:text-tertiary focus:outline-none focus:border-brand focus:ring-0 ${errors.schoolName ? 'border-error' : ''}`}
                      placeholder="Kabarak Secondary School"
                      required
                      autoComplete="organization"
                      aria-invalid={errors.schoolName ? 'true' : 'false'}
                      aria-describedby={errors.schoolName ? 'schoolName-error' : undefined}
                      disabled={submitStatus === 'submitting'}
                    />
                    {errors.schoolName && (
                      <p id="schoolName-error" className="mt-1.5 text-body-sm text-error" role="alert">{errors.schoolName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="role" className="block text-label text-primary uppercase tracking-wider mb-1.5">
                      Role
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formState.role}
                      onChange={handleChange}
                      className={`w-full px-3 py-2.5 bg-surface border border-hairline rounded-sm text-body text-primary focus:outline-none focus:border-brand focus:ring-0 ${errors.role ? 'border-error' : ''}`}
                      required
                      aria-invalid={errors.role ? 'true' : 'false'}
                      aria-describedby={errors.role ? 'role-error' : undefined}
                      disabled={submitStatus === 'submitting'}
                    >
                      <option value="">Select your role</option>
                      {ROLES.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                    {errors.role && (
                      <p id="role-error" className="mt-1.5 text-body-sm text-error" role="alert">{errors.role}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-label text-primary uppercase tracking-wider mb-1.5">
                      Phone or WhatsApp number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formState.phone}
                      onChange={handleChange}
                      className={`w-full px-3 py-2.5 bg-surface border border-hairline rounded-sm text-body text-primary placeholder:text-tertiary focus:outline-none focus:border-brand focus:ring-0 ${errors.phone ? 'border-error' : ''}`}
                      placeholder="+254 7XX XXX XXX"
                      required
                      autoComplete="tel"
                      aria-invalid={errors.phone ? 'true' : 'false'}
                      aria-describedby={errors.phone ? 'phone-error' : 'phone-hint'}
                      disabled={submitStatus === 'submitting'}
                    />
                    <p id="phone-hint" className="mt-1.5 text-body-sm text-tertiary">
                      Kenyan format: +254 7XX XXX XXX or 07XX XXX XXX. International format also accepted.
                    </p>
                    {errors.phone && (
                      <p id="phone-error" className="mt-1.5 text-body-sm text-error" role="alert">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-label text-primary uppercase tracking-wider mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formState.email}
                      onChange={handleChange}
                      className={`w-full px-3 py-2.5 bg-surface border border-hairline rounded-sm text-body text-primary placeholder:text-tertiary focus:outline-none focus:border-brand focus:ring-0 ${errors.email ? 'border-error' : ''}`}
                      placeholder="jane@school.ac.ke"
                      required
                      autoComplete="email"
                      aria-invalid={errors.email ? 'true' : 'false'}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                      disabled={submitStatus === 'submitting'}
                    />
                    {errors.email && (
                      <p id="email-error" className="mt-1.5 text-body-sm text-error" role="alert">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="studentCount" className="block text-label text-primary uppercase tracking-wider mb-1.5">
                      Number of students (optional)
                    </label>
                    <input
                      type="number"
                      id="studentCount"
                      name="studentCount"
                      value={formState.studentCount}
                      onChange={handleChange}
                      min="1"
                      max="5000"
                      className={`w-full px-3 py-2.5 bg-surface border border-hairline rounded-sm text-body text-primary placeholder:text-tertiary focus:outline-none focus:border-brand focus:ring-0 ${errors.studentCount ? 'border-error' : ''}`}
                      placeholder="e.g. 180"
                      aria-invalid={errors.studentCount ? 'true' : 'false'}
                      aria-describedby={errors.studentCount ? 'studentCount-error' : undefined}
                      disabled={submitStatus === 'submitting'}
                    />
                    {errors.studentCount && (
                      <p id="studentCount-error" className="mt-1.5 text-body-sm text-error" role="alert">{errors.studentCount}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="notes" className="block text-label text-primary uppercase tracking-wider mb-1.5">
                      Notes (optional)
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formState.notes}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-3 py-2.5 bg-surface border border-hairline rounded-sm text-body text-primary placeholder:text-tertiary focus:outline-none focus:border-brand focus:ring-0 resize-y"
                      placeholder="Anything we should know before the demo? Specific subjects, existing systems, timeline..."
                      disabled={submitStatus === 'submitting'}
                    />
                  </div>

                  {/* Honeypot field - hidden from users */}
                  <div style={{ display: 'none' }} aria-hidden="true">
                    <label htmlFor="website" className="sr-only">Website</label>
                    <input
                      type="text"
                      id="website"
                      name="honeypot"
                      value={formState.honeypot}
                      onChange={handleChange}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  <div>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="consent"
                        checked={formState.consent}
                        onChange={handleChange}
                        className="mt-1 w-4 h-4 border-hairline rounded-sm text-brand focus:ring-0 focus:border-brand"
                        required
                        aria-invalid={errors.consent ? 'true' : 'false'}
                        aria-describedby={errors.consent ? 'consent-error' : undefined}
                        disabled={submitStatus === 'submitting'}
                      />
                      <div className="text-body text-secondary leading-relaxed">
                        I consent to Chokur System using my details to contact me about the product.
                        <p className="mt-1 text-body-sm text-tertiary">
                          We'll only use your details to contact you about Chokur System. No marketing lists, no third parties.
                        </p>
                      </div>
                    </label>
                    {errors.consent && (
                      <p id="consent-error" className="mt-1.5 text-body-sm text-error" role="alert">{errors.consent}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={submitStatus === 'submitting'}
                    className="w-full lg:w-auto px-8 py-3 bg-brand text-inverse text-body font-medium rounded-sm hover:bg-brand-hover transition-base focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitStatus === 'submitting' ? (
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                        Sending…
                      </span>
                    ) : (
                      'Request a demo'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-surface border-t border-hairline py-8">
        <div className="max-w-[1200px] mx-auto px-6 text-center text-caption text-tertiary">
          © 2026 Chokur System
        </div>
      </footer>
    </div>
  );
}