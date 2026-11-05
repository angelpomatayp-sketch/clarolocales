import { useEffect, useId, useRef } from 'react';

const SIZE_CLASSES = {
    sm: 'sm:max-w-md',
    md: 'sm:max-w-lg',
    lg: 'sm:max-w-xl',
    xl: 'sm:max-w-3xl',
    '2xl': 'sm:max-w-5xl',
};

export default function AppModal({
    open,
    title,
    description,
    onClose,
    children,
    size = 'lg',
    wide = false,
    mobileFullscreen = true,
}) {
    const titleId = useId();
    const dialogRef = useRef(null);

    useEffect(() => {
        if (!open) return undefined;

        const previousOverflow = document.body.style.overflow;
        const previouslyFocused = document.activeElement;
        const closeOnEscape = (event) => {
            if (event.key === 'Escape') onClose?.();
        };

        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', closeOnEscape);
        const focusFrame = requestAnimationFrame(() => {
            if (!dialogRef.current?.contains(document.activeElement)) {
                dialogRef.current?.querySelector('button, input, select, textarea, [tabindex]:not([tabindex="-1"])')?.focus();
            }
        });

        return () => {
            cancelAnimationFrame(focusFrame);
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', closeOnEscape);
            previouslyFocused?.focus?.();
        };
    }, [open, onClose]);

    if (!open) return null;

    const desktopSize = wide ? SIZE_CLASSES.xl : (SIZE_CLASSES[size] || SIZE_CLASSES.lg);
    const mobileShape = mobileFullscreen
        ? 'h-[100dvh] rounded-none sm:h-auto sm:max-h-[92vh] sm:rounded-2xl'
        : 'max-h-[calc(100dvh-2rem)] rounded-2xl';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4" role="presentation">
            <button
                type="button"
                aria-label="Cerrar ventana"
                onClick={onClose}
                className="ui-modal-backdrop fixed inset-0 bg-gray-950/60 backdrop-blur-[2px]"
            />
            <section
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className={`ui-modal-panel relative flex w-full flex-col overflow-hidden border border-gray-200/80 bg-white shadow-2xl ${mobileShape} ${desktopSize}`}
            >
                <header className="sticky top-0 z-10 flex flex-none items-start justify-between gap-4 border-b border-gray-100 bg-white/95 px-4 py-3.5 backdrop-blur sm:px-6 sm:py-4">
                    <div className="min-w-0 py-0.5">
                        <h2 id={titleId} className="truncate text-base font-semibold text-gray-950 sm:text-lg">{title}</h2>
                        {description && <p className="mt-1 text-xs leading-5 text-gray-500 sm:text-sm">{description}</p>}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="ui-pressable flex h-11 w-11 flex-none items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                        aria-label="Cerrar modal"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5">
                    {children}
                </div>
            </section>
        </div>
    );
}
