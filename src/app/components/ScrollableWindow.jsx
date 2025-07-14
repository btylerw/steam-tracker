import React from "react";

const ScrollableWindow = ({ games }) => {
    const renderGames = (games) => {
        return games.map((game) => (
            <div key={game.appid} className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-lg font-semibold">{game.name}</h3>
                    <p>Playtime: {(game.playtime_forever / 60).toFixed(1)} hours</p>
                </div>
                <img className="h-36 w-auto" src={game.imageUrl} alt={`${game.name} icon`} />
            </div>
        ));
    };

    return (
        <div className="h-192 w-half overflow-y-auto border border-gray-300 p-4 rounded-lg shadow">
            {renderGames(games)}
        </div>
    );
};

export default ScrollableWindow;