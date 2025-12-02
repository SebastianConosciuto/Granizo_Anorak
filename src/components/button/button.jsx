import React from "react";
import "./button.css";

function Button({ 
  className = "primary", 
  onClick, 
  icon, 
  text,
  disabled = false,
  type = "button"
}) {
  const handleClick = (e) => {
    if (!disabled && onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type={type}
      className={`custom-button ${className} ${disabled ? 'disabled' : ''}`}
      onClick={handleClick}
      disabled={disabled}
    >
      {icon && (
        <span className="material-symbols-outlined button-icon">
          {icon}
        </span>
      )}
      {text && <span className="button-text">{text}</span>}
    </button>
  );
}

export default Button;