"use client";

interface ConfirmDialogProps {
    id: string;
    title: string;
    message: string;
    confirmLabel?: string;
    confirmClass?: string;
    onConfirm: () => void;
    isLoading?: boolean;
}

export default function ConfirmDialog({
    id,
    title,
    message,
    confirmLabel = "Confirm",
    confirmClass = "btn-error",
    onConfirm,
    isLoading = false,
}: ConfirmDialogProps) {
    return (
        <dialog id={id} className="modal modal-bottom sm:modal-middle">
            <div className="modal-box max-w-sm">
                <h3 className="font-bold text-base mb-2">{title}</h3>
                <p className="text-sm text-base-content/70">{message}</p>
                <div className="modal-action gap-2">
                    <form method="dialog">
                        <button className="btn btn-ghost btn-sm">Cancel</button>
                    </form>
                    <button
                        className={`btn btn-sm ${confirmClass}`}
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? <span className="loading loading-spinner loading-xs" /> : confirmLabel}
                    </button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>
    );
}
