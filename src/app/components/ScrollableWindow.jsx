import React from "react";

const ScrollableWindow = ({ games }) => {
    return (
        <div className="h-192 w-256 overflow-y-auto border border-gray-300 p-4 rounded-lg shadow">
            {games}
        </div>
    );
};

export default ScrollableWindow;