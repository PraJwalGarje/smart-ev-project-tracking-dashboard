// src/components/Modal.jsx
import React from 'react';

/**
 * Generic modal shell
 * - Handles backdrop, centering, title, close button, and footer actions.
 * - Page components pass their own form/content as `children`.
 */
export default function Modal({ open, title, onClose, children, footer }) {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="modal-backdrop"
        onClick={onClose}
      />

      {/* Centered modal card */}
      <div className="modal-outer-container">
        <div className="modal-card card">
          <div className="modal-header">
            <h3 className="modal-title">{title}</h3>
            <button
              className="modal-close-button"
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div className="modal-body">
            {children}
          </div>

          {footer && (
            <div className="modal-footer">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
