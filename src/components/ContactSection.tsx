import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { AlertCircle, Send, ArrowRight, AlertTriangle, Check } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { KineticText } from './KineticText';

const EMAILJS_SERVICE_ID = 'service_jx0f5xi';
const EMAILJS_TEMPLATE_ID = 'template_u818b2o';
const EMAILJS_PUBLIC_KEY = 'fCDoXbpU3O0mWtVNq';

const FOCUS_OPTIONS = [
  'Frontend Architecture',
  'Contract / Freelance',
  'Full-Time Role',
];

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

interface SubmittedData {
  name: string;
  email: string;
  focus: string;
  message: string;
  timestamp: string;
}

export const ContactSection: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [focus, setFocus] = useState('Frontend Architecture');
  const [message, setMessage] = useState('');

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<SubmittedData | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const successBoxRef = useRef<HTMLDivElement>(null);

  const validateField = (field: 'name' | 'email' | 'message', val: string): string => {
    const trimmed = val.trim();
    if (field === 'name') {
      if (!trimmed) return 'Please enter your name.';
      if (trimmed.length < 2) return 'Name must be at least 2 characters.';
    } else if (field === 'email') {
      if (!trimmed) return 'Please enter your email address.';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmed)) return 'Please enter a valid email address (e.g. name@example.com).';
    } else if (field === 'message') {
      if (!trimmed) return 'Please provide your project details or message.';
      if (trimmed.length < 10) return 'Message must be at least 10 characters.';
    }
    return '';
  };

  const handleBlur = (field: 'name' | 'email' | 'message') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const val = field === 'name' ? name : field === 'email' ? email : message;
    const errorMsg = validateField(field, val);
    setErrors((prev) => ({ ...prev, [field]: errorMsg || undefined }));
  };

  const handleChange = (field: 'name' | 'email' | 'message', val: string) => {
    if (field === 'name') setName(val);
    else if (field === 'email') setEmail(val);
    else if (field === 'message') setMessage(val);

    // If already touched, validate dynamically to clear error when resolved
    if (touched[field]) {
      const errorMsg = validateField(field, val);
      setErrors((prev) => ({ ...prev, [field]: errorMsg || undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendError(null);

    const nameErr = validateField('name', name);
    const emailErr = validateField('email', email);
    const msgErr = validateField('message', message);

    const newErrors: FormErrors = {};
    if (nameErr) newErrors.name = nameErr;
    if (emailErr) newErrors.email = emailErr;
    if (msgErr) newErrors.message = msgErr;

    setTouched({ name: true, email: true, message: true });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);

      // Identify first erroneous field and animate subtle shake
      const firstInvalidId = newErrors.name
        ? 'contact-name'
        : newErrors.email
        ? 'contact-email'
        : 'contact-msg';

      const invalidEl = document.getElementById(firstInvalidId);
      if (invalidEl) {
        invalidEl.focus();
        gsap.fromTo(
          invalidEl,
          { x: -8 },
          { x: 0, duration: 0.45, ease: 'elastic.out(2, 0.25)' }
        );
      }
      return;
    }

    // All fields are valid
    setErrors({});
    setIsSubmitting(true);

    const templateParams = {
      name: name.trim(),
      email: email.trim(),
      project_interest: focus,
      message: message.trim(),
    };

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      const data: SubmittedData = {
        name: name.trim(),
        email: email.trim(),
        focus,
        message: message.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      // Reset form values on successful send
      setName('');
      setEmail('');
      setMessage('');
      setErrors({});
      setTouched({});
      setSendError(null);

      setSubmittedData(data);
      setIsSubmitting(false);
      setIsSubmitted(true);
    } catch (err: unknown) {
      console.error('EmailJS send error:', err);
      setIsSubmitting(false);
      const errorMsg =
        typeof err === 'object' && err !== null && 'text' in err
          ? String((err as { text: unknown }).text)
          : 'Failed to send message. Please try again or check your connection.';
      setSendError(errorMsg);
    }
  };

  // Entrance animation for success state
  useEffect(() => {
    if (isSubmitted && successBoxRef.current) {
      const box = successBoxRef.current;
      const icon = box.querySelector('.success-symbol');
      const heading = box.querySelector('.success-heading');
      const rule = box.querySelector('.success-rule');
      const desc = box.querySelector('.success-desc');
      const btn = box.querySelector('.success-btn');

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set([box, icon, heading, rule, desc, btn], { opacity: 1, y: 0, scale: 1 });
        return;
      }

      const tl = gsap.timeline();

      tl.fromTo(
        box,
        { opacity: 0, scale: 0.98 },
        { opacity: 1, scale: 1, duration: 0.45, ease: 'power2.out' }
      );

      if (icon) {
        tl.fromTo(
          icon,
          { opacity: 0, scale: 0.8, y: -10 },
          { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'back.out(1.7)' },
          '-=0.25'
        );
      }

      if (heading) {
        tl.fromTo(
          heading,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' },
          '-=0.3'
        );
      }

      if (rule) {
        tl.fromTo(
          rule,
          { width: '0%', opacity: 0 },
          { width: '80px', opacity: 1, duration: 0.4, ease: 'power2.out' },
          '-=0.25'
        );
      }

      if (desc) {
        tl.fromTo(
          desc,
          { opacity: 0, y: 14 },
          { opacity: 0.85, y: 0, duration: 0.45, ease: 'power2.out' },
          '-=0.2'
        );
      }

      if (btn) {
        tl.fromTo(
          btn,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
          '-=0.2'
        );
      }
    }
  }, [isSubmitted]);

  const handleReset = () => {
    if (successBoxRef.current && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.to(successBoxRef.current, {
        opacity: 0,
        y: -12,
        scale: 0.98,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => {
          setName('');
          setEmail('');
          setFocus('Frontend Architecture');
          setMessage('');
          setErrors({});
          setTouched({});
          setSubmittedData(null);
          setIsSubmitted(false);
        },
      });
    } else {
      setName('');
      setEmail('');
      setFocus('Frontend Architecture');
      setMessage('');
      setErrors({});
      setTouched({});
      setSubmittedData(null);
      setIsSubmitted(false);
    }
  };

  return (
    <section id="contact" className="site-section">
      <div className="sec-head">
        <KineticText as="span" className="sec-pill" shimmer>
          Contact
        </KineticText>
        <KineticText as="h2" className="sec-title">
          Leave your details and message.
        </KineticText>
        <p className="sec-desc">
          Feel free to leave your details and message below for me to review. I am always open to discussions, collaborations, and learning opportunities.
        </p>
      </div>

      <div className="contact-layout">
        <div className="contact-sidebar">
          <div>
            <div className="contact-item-label">
              <KineticText as="span">Contact</KineticText>
            </div>
            <div style={{ fontSize: '16px', opacity: 0.85, lineHeight: 1.5 }}>
              Leave your details and message in the form, and I will review it.
            </div>
          </div>

          <div>
            <div className="contact-item-label">
              <KineticText as="span">Role</KineticText>
            </div>
            <div style={{ fontSize: '16px', opacity: 0.85, lineHeight: 1.5 }}>
              Computer Science Student &bull; Aspiring Creative Developer
            </div>
          </div>

          <div>
            <div className="contact-item-label">
              <KineticText as="span">Education</KineticText>
            </div>
            <div style={{ fontSize: '16px', opacity: 0.85, lineHeight: 1.5 }}>
              MET Bhujbal Knowledge City, Nashik
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: isSubmitted ? '0' : '32px', overflow: 'hidden' }}>
          {!isSubmitted ? (
            <form
              id="contact-form"
              ref={formRef}
              className="contact-form"
              onSubmit={handleSubmit}
              noValidate
            >
              <div className="form-row">
                <div>
                  <label
                    htmlFor="contact-name"
                    style={{ display: 'block', fontSize: '14px', marginBottom: '8px', opacity: 0.8 }}
                  >
                    Your Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="contact-name"
                    className={`form-input ${touched.name && errors.name ? 'has-error' : ''}`}
                    placeholder="Om Vhalgade"
                    value={name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    onBlur={() => handleBlur('name')}
                    aria-invalid={!!(touched.name && errors.name)}
                    aria-describedby={touched.name && errors.name ? 'name-error' : undefined}
                  />
                  {touched.name && errors.name && (
                    <span id="name-error" className="form-error-msg">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.name}</span>
                    </span>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="contact-email"
                    style={{ display: 'block', fontSize: '14px', marginBottom: '8px', opacity: 0.8 }}
                  >
                    Your Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="contact-email"
                    className={`form-input ${touched.email && errors.email ? 'has-error' : ''}`}
                    placeholder="om@company.com"
                    value={email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    aria-invalid={!!(touched.email && errors.email)}
                    aria-describedby={touched.email && errors.email ? 'email-error' : undefined}
                  />
                  {touched.email && errors.email && (
                    <span id="email-error" className="form-error-msg">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.email}</span>
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', opacity: 0.8 }}>
                  Project Interest
                </label>
                <div className="chips-group" id="focus-chips">
                  {FOCUS_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      className={`form-chip ${focus === opt ? 'selected' : ''}`}
                      onClick={() => setFocus(opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-msg"
                  style={{ display: 'block', fontSize: '14px', marginBottom: '8px', opacity: 0.8 }}
                >
                  Project Details <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="contact-msg"
                  rows={4}
                  className={`form-textarea ${touched.message && errors.message ? 'has-error' : ''}`}
                  placeholder="Tell me about your goals, timeline, and tech requirements..."
                  value={message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  onBlur={() => handleBlur('message')}
                  aria-invalid={!!(touched.message && errors.message)}
                  aria-describedby={touched.message && errors.message ? 'msg-error' : undefined}
                />
                {touched.message && errors.message && (
                  <span id="msg-error" className="form-error-msg">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.message}</span>
                  </span>
                )}
              </div>

              {sendError && (
                <div
                  className="p-3 rounded-lg flex items-center gap-2.5 text-xs text-rose-600 dark:text-rose-400 border border-rose-500/20 bg-rose-500/10"
                  role="alert"
                >
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{sendError}</span>
                </div>
              )}

              <button
                type="submit"
                className="form-submit-btn"
                id="contact-submit-btn"
                disabled={isSubmitting}
                style={{ cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Sending...</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span>Send Message</span>
                    <Send className="w-4 h-4 ml-1 opacity-80" />
                  </span>
                )}
              </button>
            </form>
          ) : (
            <div
              id="contact-success"
              ref={successBoxRef}
              className="form-success-box"
              role="status"
              aria-live="polite"
            >
              {/* Subtle ambient motion glow */}
              <div className="success-ambient-glow" aria-hidden="true" />

              {/* Minimal success symbol */}
              <div className="success-symbol success-symbol-wrap relative z-10" aria-hidden="true">
                <Check />
              </div>

              {/* Heading */}
              <h3 className="success-heading success-heading-text relative z-10">
                MESSAGE RECEIVED
              </h3>

              {/* Subtle animated accent line */}
              <div className="success-rule success-accent-rule relative z-10" aria-hidden="true" />

              {/* Supporting text */}
              <div className="success-desc success-desc-text relative z-10">
                <p style={{ margin: '0 0 6px 0' }}>Thanks for reaching out.</p>
                <p style={{ margin: 0 }}>I&apos;ll get back to you soon.</p>
              </div>

              {/* Reset interactive button */}
              <div className="success-btn relative z-10">
                <button
                  type="button"
                  id="contact-reset-btn"
                  onClick={handleReset}
                  className="success-reset-btn"
                >
                  <span>SEND ANOTHER MESSAGE</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
