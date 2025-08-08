const Sidebar = ({ currentView, setCurrentView, handleLogOut, sideBarOpen, setSideBarOpen }) => {
    return (
        <div
            className={`
                fixed top-0 left-0 h-full bg-gray-800 text-white w-64 p-6 transform transition-transform duration-300
                ${sideBarOpen ? "translate-x-0" : "-translate-x-full"} 
                md:translate-x-0 flex
                flex-col z-40
            `}
        >
            <div>
                <button 
                    onClick={() => { setCurrentView("owned"); setSideBarOpen(false) }}
                    className={`px-3 py-2 rounded-md mb-2 text-left w-full transition cursor-pointer ${
                        currentView === "owned" ? "bg-blue-600" : "hover:bg-gray-700"
                    }`}
                >
                    Owned Games
                </button>
                <button 
                    onClick={() => { setCurrentView("backlog"); setSideBarOpen(false) }}
                    className={`px-3 py-2 rounded-md mb-2 text-left w-full transition cursor-pointer ${
                        currentView === "backlog" ? "bg-blue-600" : "hover:bg-gray-700"
                    }`}
                >
                    Backlog
                </button>
            </div>
            <div className="mt-auto">
                <button onClick={handleLogOut} className="px-3 py-2 rounded-md w-full bg-red-600 hover:bg-red-700 transition cursor-pointer">
                    Log Out
                </button>
            </div>
        </div>
    );
};

export default Sidebar;