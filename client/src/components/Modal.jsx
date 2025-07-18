import React from "react";
import '../modal.css';

export default function Modal ({isOpen, onClose, onConfirm, message, showConfirmButtons}) {
    if (!isOpen) {
        return null
    };

    return (
        <div className="modal-container">
            <div className="modal-content">
                <p>{message}</p>
                {showConfirmButtons ? (
                    <div className="modal-buttons">
                        <button className="modal-btn" onClick={onClose}>Cancel</button>
                        <button className="modal-btn confirm" onClick={onConfirm}>Confirm</button>
                    </div>
                ) : (
                    <button className="modal-btn" onClick={onClose}>OK</button>
                )}
            </div>
        </div>
    );
}