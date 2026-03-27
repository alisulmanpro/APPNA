"use client";

import { ReactNode } from "react";

interface ModalProps {
    id: string;
    title: string;
    children: ReactNode;
    onClose?: () => void;
    size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
};

export default function Modal({ id, title, children, onClose, size = "md" }: ModalProps) {
    return (
        <dialog id={id} className="modal modal-bottom sm:modal-middle">
            <div className={`modal-box ${sizeClasses[size]} p-0 overflow-hidden`}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-base-200">
                    <h3 className="font-bold text-base text-base-content">{title}</h3>
                    <button
                        className="btn btn-ghost btn-sm btn-square"
                        onClick={() => {
                            const modal = document.getElementById(id) as HTMLDialogElement;
                            modal?.close();
                            onClose?.();
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-5">{children}</div>
            </div>

            {/* Backdrop */}
            <form method="dialog" className="modal-backdrop">
                <button onClick={onClose}>close</button>
            </form>
        </dialog>
    );
}

export function openModal(id: string) {
    const modal = document.getElementById(id) as HTMLDialogElement;
    modal?.showModal();
}

export function closeModal(id: string) {
    const modal = document.getElementById(id) as HTMLDialogElement;
    modal?.close();
}
