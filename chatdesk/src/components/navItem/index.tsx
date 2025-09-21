import { NavLink } from "react-router-dom";

export default function NavItem({ to, children, icon }: { to: string, children: React.ReactNode, icon?: React.ReactNode }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm " +
                (isActive ? "bg-blue-50 text-blue-700" : "hover:bg-gray-100 text-gray-700")
            }>
            {icon}
            <span className="truncate">{children}</span>
        </NavLink>
    )
}