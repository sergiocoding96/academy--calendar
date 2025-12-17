'use client'

import { Fragment, useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ModalProps = {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showClose?: boolean
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showClose = true,
}: ModalProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={cn(
            'relative w-full bg-white rounded-xl shadow-xl transform transition-all',
            sizeStyles[size]
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || showClose) && (
            <div className="flex items-start justify-between p-6 border-b border-stone-200">
              <div>
                {title && (
                  <h2 className="text-lg font-semibold text-stone-800">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="mt-1 text-sm text-stone-500">{description}</p>
                )}
              </div>
              {showClose && (
                <button
                  onClick={onClose}
                  className="p-1 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  )
}

type ConfirmModalProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'default'
  loading?: boolean
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  loading = false,
}: ConfirmModalProps) {
  const confirmButtonStyles = {
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white',
    default: 'bg-red-600 hover:bg-red-700 text-white',
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showClose={false}>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-stone-800 mb-2">{title}</h3>
        {description && (
          <p className="text-stone-500 mb-6">{description}</p>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              'px-4 py-2 rounded-lg transition-colors disabled:opacity-50',
              confirmButtonStyles[variant]
            )}
          >
            {loading ? 'Loading...' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}
