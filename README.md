## Steam Tracker
### [Live Demo](https://steamtracker.tyler-brown.dev)  
If you're anything like me, you buy tons of games on Steam during big sales, only to never play them.  
Steam Tracker helps to keep track of just how much unplayed content you have in your steam library.  
By taking advantage of the Steam API, and the unofficial HowLongToBeat API, Steam Tracker retrieves your Steam Library and compares your playtimes
with average completion times for each title to provide details of how long it will take to fully clear your backlog.  
This app uses OpenID to authenticate your Steam account to retrieve your SteamID to make appropriate API calls.  
Steam ID will not be saved, the only data that will be stored is account information specific to this app as well as limited game library data to avoid repetitive API usage

### Technologies Used
* [Next.js](https://nextjs.org/)
* [React](https://reactjs.org/)
* [PostgreSQL](https://www.postgresql.org)

### APIs Used
* [SteamAPI](https://steamcommunity.com/dev)
* [HowLongToBeatAPI](https://github.com/ckatzorke/howlongtobeat)

### TODOS
~~Setup and connect database to store user information~~  
~~Setup authentication (JWT)~~  
~~Allow users to customize backlog~~  
~~Store backlog data in database to avoid performance heavy and repetitive API calls~~  
* Create method to track progress on completing markdown
* Update styling on Games/Backlog pages to more neatly display items
* Investigate adding progress bars to backlog games
* Add more account statistics to Home page