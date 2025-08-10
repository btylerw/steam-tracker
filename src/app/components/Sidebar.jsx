import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Owned Games", view: "owned" },
  { name: "Backlog", view: "backlog" }
];

export default function Sidebar({ currentView, setCurrentView, handleLogOut, sideBarOpen, setSideBarOpen }) {
    return (
        <aside
        className={`flex flex-col fixed lg:static lg:h-screen top-0 left-0 h-full bg-gray-900 text-white w-64 p-4 transform transition-transform duration-300 z-40
            ${sideBarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
        >
            <nav className="flex-1 flex flex-col gap-2">
                {navItems.map((item) => (
                <button
                    key={item.name}
                    className={`w-full px-4 py-2 rounded text-left cursor-pointer ${
                    currentView === item.view ? "bg-gray-700" : "hover:bg-gray-700"
                    }`}
                    onClick={() => {
                    setCurrentView(item.view);
                    setSideBarOpen(false);
                    }}
                >
                    {item.name}
                </button>
                ))}
            </nav>
            <div className="mt-auto">
                <button
                onClick={handleLogOut}
                className="w-full mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 rounded cursor-pointer"
                >
                    Log Out
                </button>
            </div>
    </aside>
  );
}
