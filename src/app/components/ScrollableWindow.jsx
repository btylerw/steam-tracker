import React from "react";

const ScrollableWindow = ({ games }) => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {games}
        </div>
    );
};

export default ScrollableWindow;