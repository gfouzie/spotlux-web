'use client';

interface AddButtonProps {
  onClick: () => void;
  ariaLabel: string;
  className?: string;
}

const AddButton = ({ onClick, ariaLabel, className = '' }: AddButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`cursor-pointer flex items-center justify-center w-7 h-7 rounded-lg border border-accent-col text-accent-col hover:opacity-80 transition-opacity ${className}`}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      <span className="text-xl font-semibold">+</span>
    </button>
  );
};

export default AddButton;
