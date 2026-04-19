# ShowTracker Redis

**ShowTracker Redis** is Project 3 for CS3200 (Database Systems). It extends the MongoDB-based **ShowTracker** live-music tracking app by adding **Redis** as an in-memory key-value store.

## Data model (MongoDB)

| Collection | Purpose |
|------------|---------|
| **users** | `user_id`, `username`, `email`, `password`, `followed_artists`, embedded `attendance` |
| **shows** | `show_id`, `date`, `ticketPrice`, `venue_id`, `artists`, embedded `setlist` |
| **artists** | `artist_id`, `name`, `genre`, `biography`, embedded `songs` |
| **venues** | `venue_id`, `name`, `city`, `state`, `capacity`, `genreTags` |

## Redis usage

A **sorted set** leaderboard tracks how many users follow each artist:

- **Key:** `leaderboard:artists`
- **Member:** artist name
- **Score:** follow count

## Project layout

```
show-tracker-redis/
├── README.md
├── documents/requirements.pdf   (add locally)
├── diagrams/*.png               (add locally)
└── app/                         Node + Express + EJS + MongoDB + Redis
```

## Prerequisites

- Node.js (LTS recommended)
- MongoDB at `mongodb://localhost:27017` (database name: `showtracker`)
- Redis at `redis://localhost:6379`

## Run the app

```bash
cd app
npm install
npm start
```

For development with auto-restart:

```bash
npm run dev
```

The server listens on **port 3000**. Open [http://localhost:3000](http://localhost:3000) for the home page and [http://localhost:3000/leaderboard](http://localhost:3000/leaderboard) for the leaderboard view.

## Status

This repository currently contains a **skeleton** only: Express routes and views are wired up; Redis leaderboard queries and MongoDB integration are left as placeholders for later implementation.
