import React from "react";

type CommonButtonProps = {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
};

export const Button = ({
  children,
  onClick,
  className,
  type = "button",
  disabled,
}: CommonButtonProps) => {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={[
        "inline-flex items-center justify-center",
        "rounded-lg px-5 py-2.5 font-semibold",
        "bg-slate-900 text-white hover:bg-slate-800",
        "shadow-sm",
        "transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        "disabled:opacity-50 disabled:pointer-events-none",
        className ?? "",
      ].join(" ")}
    >
      {children}
    </button>
  );
};

export const SecondaryButton = ({
  children,
  onClick,
  isSelected,
  className,
  type = "button",
  disabled,
}: CommonButtonProps & { isSelected: boolean }) => {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={[
        "inline-flex items-center justify-center",
        "rounded-lg px-5 py-2.5 font-semibold",
        "shadow-sm",
        "transition-colors",
        isSelected
          ? "bg-blue-600 text-white hover:bg-blue-700"
          : "bg-white text-slate-900 hover:bg-slate-50 border border-slate-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        "disabled:opacity-50 disabled:pointer-events-none",
        className ?? "",
      ].join(" ")}
    >
      {children}
    </button>
  );
};