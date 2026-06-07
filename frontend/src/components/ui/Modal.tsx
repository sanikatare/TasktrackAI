import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { ModalProps } from '@/types';
import clsx from 'clsx';

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <div className={clsx(
        'relative w-full max-w-lg rounded-2xl bg-white border border-slate-200/60 animate-scale-in',
      )}
        style={{ boxShadow: '0 24px 48px rgba(15,23,42,0.12), 0 8px 24px rgba(37,99,235,0.08)' }}
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Modal'}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100/80">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">{title}</h2>
            <button onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
              aria-label="Close">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
