export default function NavGroup({ title, icon }: { title: string; icon?: React.ReactNode }) {
    return (
        <div className="px-2">
            <div className="flex items-center gap-2 px-1 py-2 text-gray-700">
                {icon}
                <span className="truncate">{title}</span>
            </div>
        </div>
    );
}