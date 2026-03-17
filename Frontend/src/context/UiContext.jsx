import React, { createContext, useContext, useState, useCallback } from 'react';
import './UiContext.css'; 

const UiContext = createContext();

export const useUi = () => {
  const context = useContext(UiContext);
  if (!context) {
    throw new Error("useUi must be used within a UiProvider");
  }
  return context;
};

export const UiProvider = ({ children }) => {
  // --- TOAST STATE ---
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  // --- CONFIRM MODAL STATE ---
  const [confirm, setConfirm] = useState({ 
    show: false, 
    message: '', 
    onConfirm: null 
  });

  // Helper to show Toast
  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  }, []);

  // Helper to show Confirm Dialog
  const showConfirm = useCallback((message, onConfirmAction) => {
    setConfirm({
      show: true,
      message,
      onConfirm: async () => {
        await onConfirmAction();
        setConfirm({ show: false, message: '', onConfirm: null });
      }
    });
  }, []);

  const closeConfirm = () => setConfirm({ show: false, message: '', onConfirm: null });

  return (
    <UiContext.Provider value={{ showToast, showConfirm }}>
      {children}
      
      {/* --- RENDER TOAST --- */}
      <div className={`custom-toast ${toast.show ? 'show' : ''} ${toast.type}`}>
        <span className="toast-icon">{toast.type === 'success' ? '✓' : '!'}</span>
        {toast.message}
      </div>

      {/* --- RENDER CONFIRM MODAL --- */}
      {confirm.show && (
        <div className="custom-confirm-overlay">
          <div className="custom-confirm-box">
            <h3>Confirmation Required</h3>
            <p>{confirm.message}</p>
            <div className="confirm-actions">
              <button className="btn-cancel" onClick={closeConfirm}>Cancel</button>
              <button className="btn-confirm" onClick={confirm.onConfirm}>Confirm Action</button>
            </div>
          </div>
        </div>
      )}
    </UiContext.Provider>
  );
};