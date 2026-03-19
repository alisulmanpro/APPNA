"use client";

import { useRef, useEffect, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description?: string;
    children?: ReactNode;
    confirmLabel?: string;
    confirmVariant?: "btn-error" | "btn-warning" | "btn-primary";
    isLoading?: boolean;
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    children,
    confirmLabel = "Confirm",
    confirmVariant = "btn-error",
    isLoading = false,
}: ConfirmModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        if (isOpen) {
            dialogRef.current?.showModal();
        } else {
            dialogRef.current?.close();
        }
    }, [isOpen]);

    return (
        <dialog ref={dialogRef} className="modal" onClose={onClose}>
            <div className="modal-box max-w-md">
                {/* Icon + Title */}
                <div className="flex items-start gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <AlertTriangle size={18} className="text-error" />
                    </div>
                    <div>
                        <h3 className="font-bold text-base-content text-lg">{title}</h3>
                        {description && (
                            <p className="text-sm text-base-content/60 mt-1">{description}</p>
                        )}
                    </div>
                </div>

                {/* Optional children (e.g. reason textarea) */}
                {children && <div className="mb-4">{children}</div>}

                {/* Actions */}
                <div className="modal-action mt-0">
                    <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className={`btn btn-sm ${confirmVariant}`}
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading && <span className="loading loading-spinner loading-xs"></span>}
                        {confirmLabel}
                    </button>
                </div>
            </div>

            {/* Backdrop close */}
            <form method="dialog" className="modal-backdrop">
                <button onClick={onClose}>close</button>
            </form>
        </dialog>
    );
}
