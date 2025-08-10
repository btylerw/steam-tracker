"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Dashboard({ children, profile, currentView, setCurrentView, handleLogOut }) {
    const [sideBarOpen, setSideBarOpen] = useState(false);

    return (
        <div className="flex min-h-screen">
            {!sideBarOpen && 
                <button
                    className="lg:hidden p-2 text-white bg-gray-700 rounded-md fixed top-4 left-4 z-50"
                    onClick={() => setSideBarOpen(!sideBarOpen)}
                >
                    ☰
                </button>
            }

            {sideBarOpen && (
                <div
                className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                onClick={() => setSideBarOpen(false)}
                />
            )}

            <Sidebar
                currentView={currentView}
                setCurrentView={setCurrentView}
                handleLogOut={handleLogOut}
                sideBarOpen={sideBarOpen}
                setSideBarOpen={setSideBarOpen}
            />

            <div className="flex-1 flex flex-col">
                <Header profile={profile} />
                <main className="flex-1 p-6 flex flex-col items-center gap-6 overflow-y-auto">
                {children}
                </main>
            </div>
        </div>
    );
    }
