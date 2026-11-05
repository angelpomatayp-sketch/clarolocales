export default function EmptyState({
    title,
    description,
    actionLabel,
    onAction,
    icon,
    compact = false,
}) {
    return (
        <div className={`rounded-2xl border border-dashed border-gray-300 bg-white text-center ${compact ? 'px-5 py-8' : 'px-5 py-12 sm:py-14'}`}>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-500">
                {icon || (
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-3-3v6m9-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                )}
            </div>
            <h3 className="mt-4 text-sm font-semibold text-gray-900 sm:text-base">{title}</h3>
            {description && <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-gray-500">{description}</p>}
            {actionLabel && onAction && (
                <button type="button" onClick={onAction} className="ui-pressable mt-5 min-h-11 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700">
                    {actionLabel}
                </button>
            )}
        </div>
    );
}
