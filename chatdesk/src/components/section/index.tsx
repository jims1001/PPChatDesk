export default function Section({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div className="mb-3">
            {title && <div className="px-3 py-2 text-xs uppercase tracking-wide text-gray-400">{title}</div>}
            <div className="space-y-0.5">{children}</div>
        </div>
    )
}