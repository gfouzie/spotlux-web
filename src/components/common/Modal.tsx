'use client';

import { useEffect, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Xmark } from 'iconoir-react';
import Button from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
  // Footer props
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  hideConfirm?: boolean;
  hideCancel?: boolean;
  confirmDisabled?: boolean;
  cancelDisabled?: boolean;
  confirmLoading?: boolean;
  confirmVariant?: 'primary' | 'secondary' | 'danger' | 'success';
  showFooter?: boolean;
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      isOpen,
      onClose,
      title,
      children,
      size = 'md',
      showCloseButton = true,
      closeOnOverlayClick = true,
      className,
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      onConfirm,
      onCancel,
      hideConfirm = false,
      hideCancel = false,
      confirmDisabled = false,
      cancelDisabled = false,
      confirmLoading = false,
      confirmVariant = 'primary',
      showFooter = false,
    },
    ref
  ) => {
    // Use onCancel if provided, otherwise fall back to onClose
    const handleCancel = onCancel || onClose;
    // Handle escape key
    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isOpen) {
          onClose();
        }
      };

      if (isOpen) {
        document.addEventListener('keydown', handleEscape);
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
      }

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }, [isOpen, onClose]);

    if (!isOpen) {
      return null;
    }

    const sizeStyles = {
      sm: 'max-w-md mx-4',
      md: 'max-w-lg mx-4',
      lg: 'max-w-2xl mx-4',
      xl: 'max-w-4xl mx-4',
      full: 'max-w-full mx-4',
    };

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center h-screen w-screen"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0 w-full h-full bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={closeOnOverlayClick ? onClose : undefined}
          aria-hidden="true"
        />

        {/* Modal Content */}
        <div
          ref={ref}
          className={cn(
            'relative w-full bg-card-col rounded-lg shadow-xl',
            'transform transition-all duration-200',
            'max-h-[75vh] lg:max-h-[90vh] overflow-hidden flex flex-col',
            sizeStyles[size],
            className
          )}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-bg-col/50">
              {title && (
                <h2
                  id="modal-title"
                  className="text-lg lg:text-xl font-semibold"
                >
                  {title}
                </h2>
              )}
              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  className="cursor-pointer ml-auto p-2 rounded-lg text-text-col/60 hover:text-text-col hover:bg-bg-col/50 transition-colors"
                  aria-label="Close modal"
                >
                  <Xmark className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>

          {/* Footer */}
          {showFooter && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-bg-col/50">
              <div className="flex-1">
                {!hideCancel && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCancel}
                    disabled={cancelDisabled || confirmLoading}
                  >
                    {cancelText}
                  </Button>
                )}
              </div>
              <div className="flex-1 flex justify-end">
                {!hideConfirm && onConfirm && (
                  <Button
                    type="button"
                    variant={confirmVariant}
                    onClick={onConfirm}
                    disabled={confirmDisabled || confirmLoading}
                    isLoading={confirmLoading}
                  >
                    {confirmText}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

Modal.displayName = 'Modal';

export default Modal;
