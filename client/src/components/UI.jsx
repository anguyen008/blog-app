/**
 * UI.jsx - Reusable UI Components
 * 
 * Collection of shared UI components used across the application including:
 * - Brand logo
 * - Topbar
 * - Loading spinner
 * - Toast notifications
 * - Confirm modals
 * - Icon definitions
 */

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";

/**
 * Brand - Ink logo component
 * Clickable when onClick handler is provided (e.g., for navigation)
 */
export function Brand({ onClick }) {
  return (
    <div className="brand" onClick={onClick} role={onClick ? "button" : undefined} tabIndex={onClick ? 0 : undefined}>
      Ink<span className="brand-dot">.</span>
    </div>
  );
}

/**
 * Topbar - Header navigation bar
 * Container for header content like brand and action buttons
 */
export function Topbar({ children }) {
  return <header className="topbar">{children}</header>;
}

/**
 * Spinner - Loading indicator
 * Accessible loading animation
 */
export function Spinner() {
  return <span className="spinner" role="status" aria-label="Loading" />;
}

/**
 * Toast Notification System
 * Global system for displaying temporary notification messages
 */

// Internal listeners for toast events
let _toastListeners = [];

/**
 * Show a toast notification
 * @param {string} message - Message to display
 * @param {string} type - Notification type (default, error, success)
 */
export function showToast(message, type = "default") {
  _toastListeners.forEach(fn => fn({ message, type, id: Date.now() }));
}

/**
 * ToastContainer - Renders all active toasts
 * Handles toast lifecycle (display for 2.8 seconds then remove)
 */
export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    // Handle incoming toast events
    function handler(t) {
      setToasts(prev => [...prev, t]);
      // Auto-dismiss toast after 2.8 seconds
      setTimeout(() => setToasts(prev => prev.filter(x => x.id !== t.id)), 2800);
    }
    _toastListeners.push(handler);
    // Cleanup listener on unmount
    return () => { _toastListeners = _toastListeners.filter(fn => fn !== handler); };
  }, []);

  if (!toasts.length) return null;
  return (
    <div className="toast-wrap">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>{t.message}</div>
      ))}
    </div>
  );
}

/**
 * ConfirmModal - Confirmation dialog
 * Used for user confirmation on destructive actions
 */
export function ConfirmModal({ title, message, confirmLabel = "Confirm", danger = false, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="modal-actions">
          <button className="btn ghost" onClick={onCancel}>Cancel</button>
          <button className={`btn ${danger ? "danger primary" : "primary"}`} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}




/**
 * Icons - Collection of inline SVG icons
 * Used throughout the application for UI actions and indicators
 */
export const Icons = {
  pen: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
    </svg>
  ),
  plus: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  trash: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
    </svg>
  ),
  settings: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  back: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
    </svg>
  ),
  file: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
    </svg>
  ),
  eye: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  logout: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  grid: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  more: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="currentColor">
        <circle cx="5" cy="12" r="2" />
        <circle cx="12" cy="12" r="2" />
        <circle cx="19" cy="12" r="2" />
    </svg>
  ),
  bullet: (<svg xmlns="http://w3.org" viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  <circle cx="5" cy="6" r="0.75" fill="currentColor"/>
  <circle cx="5" cy="12" r="0.75" fill="currentColor"/>
  <circle cx="5" cy="18" r="0.75" fill="currentColor"/>
  <line x1="10" y1="6" x2="19" y2="6"/>
  <line x1="10" y1="12" x2="19" y2="12"/>
  <line x1="10" y1="18" x2="19" y2="18"/>
</svg>

),
  numbers:( 
    <>
        <svg xmlns="http://w3.org" viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <text x="2" y="7" fontFamily="Arial, sans-serif" fontSize="6" fontWeight="bold" fill="currentColor">1</text>
          <line x1="8" y1="5" x2="22" y2="5" />
          
          <text x="2" y="14" fontFamily="Arial, sans-serif" fontSize="6" fontWeight="bold" fill="currentColor">2</text>
          <line x1="8" y1="12" x2="22" y2="12" />
          
          <text x="2" y="21" fontFamily="Arial, sans-serif" fontSize="6" fontWeight="bold" fill="currentColor">3</text>
          <line x1="8" y1="19" x2="22" y2="19" />
        </svg>
      </>
    ), 
  
  alignleft:(
    <svg xmlns="http://w3.org" width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="21" y1="6" x2="3" y2="6"></line>
      <line x1="14" y1="12" x2="3" y2="12"></line>
      <line x1="18" y1="18" x2="3" y2="18"></line>
    </svg>
  ),
  alignCenter:(
    <svg xmlns="http://w3.org" width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  <line x1="21" y1="6" x2="3" y2="6"></line>
  <line x1="17" y1="12" x2="7" y2="12"></line>
  <line x1="19" y1="18" x2="5" y2="18"></line>
    </svg>
  ),
  alignRight:(
    <svg xmlns="http://w3.org" width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  <line x1="21" y1="6" x2="3" y2="6"></line>
  <line x1="21" y1="12" x2="9" y2="12"></line>
  <line x1="21" y1="18" x2="5" y2="18"></line>
</svg>

  )

};
