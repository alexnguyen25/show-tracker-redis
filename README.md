# ShowTracker Redis

A Redis-powered extension of **ShowTracker**, a live music tracking platform. This project adds an in-memory key-value store using Redis to power a real-time artist follow leaderboard. Built on top of the MongoDB database from Project 2.

---

## Quick Start

```bash
# 1. Make sure MongoDB and Redis are running
brew services start mongodb-community
brew services start redis

# 2. Install dependencies and start the app
cd app
npm install
npm start
```

---

## Repository Structure

```
show-tracker-redis/
├── README.md                          ← This file
│
├── documents/
│   ├── requirements.pdf               ← [Task 1] Requirements document (reused from Project 2)
│   └── redis_commands.md              ← [Task 3] All Redis CRUD commands
│
├── diagrams/
│   ├── uml_class_diagram.png          ← [Task 1] UML Conceptual Model (reused from Project 2)
│   └── logical_model.png              ← [Task 1] Hierarchical Logical Data Model (reused from Project 2)
│
└── app/                               ← [Task 4] Node + Express + Redis application
    ├── package.json
    ├── app.js
    ├── seedLeaderboard.js
    ├── db/
    │   ├── mongo.js
    │   └── redis.js
    ├── routes/
    │   └── leaderboard.js
    └── views/
        ├── partials/
        │   └── header.ejs
        ├── index.ejs
        └── leaderboard.ejs
```

---

## Assignment Deliverables

### Task 1 — Problem Requirements & Conceptual Model (10 pts)

**Files:**
- [`documents/requirements.pdf`](documents/requirements.pdf)
- [`diagrams/uml_class_diagram.png`](diagrams/uml_class_diagram.png)
- [`diagrams/logical_model.png`](diagrams/logical_model.png)

Reused from Projects 1 and 2. ShowTracker is a live music tracking platform where users can follow artists, attend shows, and browse setlists. For Project 3, Redis is added to power a real-time artist follow leaderboard — tracking how many users follow each artist using a Redis sorted set.

---

### Task 2 — Redis Data Structure Description (30 pts)

**Feature:** Artist Follow Leaderboard

ShowTracker users follow artists — this data lives in MongoDB in the `users` collection as an array of `artist_id` references. Rather than running a MongoDB aggregation pipeline every time the leaderboard is loaded, follow counts are precomputed and stored in Redis for fast in-memory access.

**Data Structure:** Sorted Set

| Property | Value |
|---|---|
| Key | `leaderboard:artists` |
| Type | Sorted Set |
| Member | Artist name (string) |
| Score | Number of users following that artist (integer) |
| Persistence | In-memory — seeded from MongoDB on app startup |

**Why a Sorted Set?**

A Redis sorted set is the ideal structure for a leaderboard because members are automatically ranked by score, scores can be incremented atomically with `ZINCRBY`, and reading the full ranked list is a single command. Alternative structures considered:

| Structure | Why not chosen |
|---|---|
| Hash | No built-in ranking |
| List | Ordered by insertion, not score |
| Set | No scores — cannot rank members |
| String | Only stores a single value |

**Example state after seeding:**
```
leaderboard:artists:
  "Phoebe Bridgers"    → score: 3
  "Khruangbin"         → score: 3
  "Japanese Breakfast" → score: 3
  "Mitski"             → score: 2
```

---

### Task 3 — Redis Commands for CRUD Operations (30 pts)

**File:** [`documents/redis_commands.md`](documents/redis_commands.md)

All commands use the key `leaderboard:artists`.

**Initialize:**
```
FLUSHALL
ZADD leaderboard:artists 3 "Phoebe Bridgers"
ZADD leaderboard:artists 3 "Khruangbin"
ZADD leaderboard:artists 3 "Japanese Breakfast"
ZADD leaderboard:artists 2 "Mitski"
EXISTS leaderboard:artists
```

**Create:**
```
ZADD leaderboard:artists 0 "New Artist"
```

**Read:**
```
ZRANGE leaderboard:artists 0 -1 REV WITHSCORES
ZSCORE leaderboard:artists "Phoebe Bridgers"
ZREVRANK leaderboard:artists "Mitski"
ZCARD leaderboard:artists
```

**Update:**
```
ZINCRBY leaderboard:artists 1 "Mitski"
ZINCRBY leaderboard:artists -1 "Mitski"
```

**Delete:**
```
ZREM leaderboard:artists "New Artist"
DEL leaderboard:artists
```

---

### Task 4 — Node + Express + Redis Application (30 pts)

**Directory:** [`app/`](app/)

A web application built with Node.js, Express, MongoDB, Redis, and EJS templates. The leaderboard page reads from and writes to the Redis sorted set in real time.

**How to run:**
1. Make sure MongoDB is running: `brew services start mongodb-community`
2. Make sure Redis is running: `brew services start redis`
3. Then:
```bash
cd app
npm install
npm start
```
4. Open `http://localhost:3000` in your browser

**Features:**

| Route | Method | Description |
|---|---|---|
| `/leaderboard` | GET | Display all artists ranked by follow count |
| `/leaderboard/add` | POST | Add a new artist to the leaderboard |
| `/leaderboard/increment/:artistName` | POST | Increment an artist's follow count by 1 |
| `/leaderboard/decrement/:artistName` | POST | Decrement an artist's follow count by 1 |
| `/leaderboard/remove/:artistName` | POST | Remove an artist from the leaderboard |
| `/leaderboard/reset` | POST | Delete and re-seed leaderboard from MongoDB |

**On startup**, the app connects to both MongoDB and Redis, then seeds the leaderboard from MongoDB follow data if the key does not already exist.

---

## Video Demo

[Link to YouTube demo](#) ← replace with your YouTube link

---

## AI Usage

AI (Claude by Anthropic) was used throughout this project for the following:

- **Planning** — breaking down project deliverables into phases and creating a work plan
- **Redis Data Structure Design** — selecting the sorted set structure, designing the key schema, and justifying the choice over alternatives
- **Redis Commands** — generating all CRUD commands for the leaderboard sorted set
- **Node + Express App** — generating the Cursor prompt to scaffold the skeleton, implementing the seeding logic, leaderboard routes, and EJS views
- **README** — generating documentation in the same style as Projects 1 and 2 using prompts like "generate a readme for my repository making sure it answers all the tasks in the rubric"

All AI-generated content was reviewed, tested, and verified before inclusion in the project.