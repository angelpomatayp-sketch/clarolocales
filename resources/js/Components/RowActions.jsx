import { useRef } from 'react';

export function RowActions({ children, label = 'Abrir acciones' }) {
    const detailsRef = useRef(null);

    const closeAfterAction = (event) => {
        if (event.target.closest('button, a')) {
            requestAnimationFrame(() => detailsRef.current?.removeAttribute('open'));
        }
    };

    return (
        <details ref={detailsRef} className="group relative inline-block text-left">
            <summary className="ui-pressable flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-xl border border-transparent text-gray-400 hover:border-gray-200 hover:bg-gray-50 hover:text-gray-700 [&::-webkit-details-marker]:hidden" aria-label={label}>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M10 6.25a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5zM10 11.25a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5zM10 16.25a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5z" />
                </svg>
            </summary>
            <div onClick={closeAfterAction} className="absolute right-0 z-30 mt-1 min-w-40 origin-top-right rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl">
                {children}
            </div>
        </details>
    );
}

export function RowAction({ children, danger = false, disabled = false, className = '', ...props }) {
    return (
        <button
            type="button"
            disabled={disabled}
            className={`ui-pressable flex min-h-10 w-full items-center rounded-lg px-3 py-2 text-left text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40 ${danger ? 'text-red-700 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-50'} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
