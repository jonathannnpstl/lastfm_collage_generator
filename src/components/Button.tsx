import React from "react";

type ButtonProps = {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  bgColor?: string;
};

const Button: React.FC<ButtonProps> = ({
  children,
  type = "button",
  onClick,
  className = "",
  disabled = false,
  bgColor
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-md ${bgColor ? bgColor : "bg-red-700 hover:bg-red-800"} text-white py-2 font-medium transition cursor-pointer
         disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
