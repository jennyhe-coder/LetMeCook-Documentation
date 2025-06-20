import React from "react";
import '../modal.css';

export default function Modal ({isOpen, onClose, message}) {
    if (!isOpen) {
        return null
    };

    return (
        <div className="modal-container">
            <div className="modal-content">
                <p>{message}</p>
                <button className="modal-btn" onClick={onClose}>OK</button>
            </div>
        </div>
    );
}