export function LoadingBar({ show }) {
    if (!show) return null;

    return (
        <div className="fixed inset-x-0 top-0 z-[70] h-0.5 overflow-hidden bg-red-100" role="progressbar" aria-label="Cargando contenido">
            <span className="ui-loading-bar block h-full w-2/5 bg-red-600" />
        </div>
    );
}

export function ListSkeleton({ rows = 4 }) {
    return (
        <div className="space-y-3" aria-label="Cargando registros" aria-busy="true">
            {Array.from({ length: rows }, (_, index) => (
                <div key={index} className="rounded-xl border border-gray-200 bg-white p-4">
                    <div className="ui-skeleton h-3 w-24 rounded" />
                    <div className="ui-skeleton mt-3 h-4 w-2/3 rounded" />
                    <div className="ui-skeleton mt-2 h-3 w-1/2 rounded" />
                </div>
            ))}
        </div>
    );
}
