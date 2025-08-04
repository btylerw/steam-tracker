import React from "react";

const ScrollableWindow = ({ games }) => {
    return (
        <div className="w-full max-w-md h-[60vh] overflow-y-auto border border-gray-300 p-4 rounded-lg shadow-md bg-white dark:bg-gray-800">
            {games}
        </div>
    );
};

export default ScrollableWindow;