import React, { useState } from 'react';
import type { NextPage } from 'next';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormStatus {
  type: 'idle' | 'loading' | 'success' | 'error';
  message: string;
}

const ContactPage: NextPage = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [status, setStatus] = useState<FormStatus>({
    type: 'idle',
    message: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: 'Sending...' });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({
          type: 'success',
          message: 'Message sent successfully! We will get back to you soon.',
        });
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
        });
      } else {
        setStatus({
          type: 'error',
          message: data.message || 'Failed to send message. Please try again.',
        });
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'An error occurred. Please try again later.',
      });
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formWrapper}>
        <h1 style={styles.title}>Contact Us</h1>
        <p style={styles.subtitle}>
          We'd love to hear from you. Send us a message!
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label htmlFor="name" style={styles.label}>
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="email" style={styles.label}>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="subject" style={styles.label}>
              Subject
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="message" style={styles.label}>
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={6}
              style={styles.textarea}
            />
          </div>

          {status.message && (
            <div
              style={{
                ...styles.statusMessage,
                backgroundColor:
                  status.type === 'success'
                    ? '#d4edda'
                    : status.type === 'error'
                    ? '#f8d7da'
                    : '#fff3cd',
                color:
                  status.type === 'success'
                    ? '#155724'
                    : status.type === 'error'
                    ? '#721c24'
                    : '#856404',
                borderColor:
                  status.type === 'success'
                    ? '#c3e6cb'
                    : status.type === 'error'
                    ? '#f5c6cb'
                    : '#ffeeba',
              }}
            >
              {status.message}
            </div>
          )}

          <button
            type="submit"
            disabled={status.type === 'loading'}
            style={{
              ...styles.button,
              opacity: status.type === 'loading' ? 0.6 : 1,
              cursor: status.type === 'loading' ? 'not-allowed' : 'pointer',
            }}
          >
            {status.type === 'loading' ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fdf8f0',
    padding: '20px',
  },
  formWrapper: {
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 8px 40px rgba(10, 22, 40, 0.18)',
    maxWidth: '600px',
    width: '100%',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#0a1628',
    marginBottom: '12px',
    fontFamily: "'Playfair Display', serif",
  },
  subtitle: {
    color: '#8899b5',
    marginBottom: '32px',
    fontSize: '16px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#0a1628',
  },
  input: {
    padding: '12px 16px',
    border: '1px solid #c9a84c',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    transition: 'all 0.3s ease',
    backgroundColor: '#fdf8f0',
  } as React.CSSProperties,
  textarea: {
    padding: '12px 16px',
    border: '1px solid #c9a84c',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    transition: 'all 0.3s ease',
    backgroundColor: '#fdf8f0',
    resize: 'vertical',
  } as React.CSSProperties,
  button: {
    padding: '14px 28px',
    backgroundColor: '#0a1628',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
  } as React.CSSProperties,
  statusMessage: {
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid',
    fontSize: '14px',
  },
};

export default ContactPage;
