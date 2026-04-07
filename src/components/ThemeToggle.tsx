import React, { useState, useEffect } from 'react';

declare global {
  interface Window {
    mermaid: any;
  }
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    // Check for saved theme preference or default to dark
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
    // Save theme preference
    localStorage.setItem('theme', theme);

    // Update mermaid theme
    if (typeof window !== 'undefined' && window.mermaid) {
      const mermaidTheme = theme === 'light' ? 'default' : 'dark';
      window.mermaid.initialize({ startOnLoad: false, theme: mermaidTheme });
      // Re-render existing mermaid diagrams
      window.mermaid.init(undefined, '.mermaid');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      style={{
        background: 'var(--surface)',
        color: 'var(--text-primary)',
        border: '1px solid var(--surface-border)',
        padding: '0.45rem 1rem',
        borderRadius: 'var(--radius)',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        transition: 'background 0.2s ease, border-color 0.2s ease',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
}