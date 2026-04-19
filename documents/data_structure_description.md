# ShowTracker – Redis Data Structure Description

## Overview

ShowTracker uses Redis as an in-memory key-value store to power a **real-time artist follow leaderboard**. The leaderboard tracks how many users follow each artist and displays them ranked from most to least followed. This is a natural fit for Redis because leaderboard data is read frequently, changes incrementally, and benefits from fast in-memory access rather than running an aggregation query against MongoDB every time the page loads.

---

## Selected Feature: Artist Follow Leaderboard

In ShowTracker, users can follow artists. This data lives in MongoDB in the `users` collection as an array of `artist_id` references:

```json
{
  "user_id": 1,
  "username": "alexn",
  "followed_artists": [1, 3]
}
```

Rather than running a MongoDB aggregation pipeline every time a user visits the leaderboard page, we precompute the follow counts and store them in Redis. Any time a follow count changes, we update Redis directly using a single fast command.

---

## Redis Data Structure: Sorted Set

**Key:** `leaderboard:artists`

**Structure:** Sorted Set (`ZSET`)

**Members:** Artist names (e.g. `"Phoebe Bridgers"`, `"Mitski"`)

**Scores:** Number of users following that artist (e.g. `3`, `2`)

### Why a Sorted Set?

A Redis sorted set is the ideal structure for a leaderboard because:

- Members are **automatically ranked by score** — no manual sorting needed
- Scores can be **incremented or decremented atomically** with `ZINCRBY`
- Reading the full leaderboard in ranked order is a single `ZRANGE ... REV` command
- It supports **O(log N)** insertions and lookups, making it extremely fast even at scale

### Alternative structures considered:

| Structure | Why not chosen |
|---|---|
| Hash | Can store key-value pairs but has no built-in ranking |
| List | Ordered by insertion, not by score — would require manual re-sorting |
| Set | No scores — cannot rank members |
| String | Only stores a single value — cannot hold multiple artists |

---

## Key Design

| Property | Value |
|---|---|
| Key | `leaderboard:artists` |
| Type | Sorted Set |
| Member | Artist name (string) |
| Score | Follow count (integer) |
| Persistence | In-memory only — seeded from MongoDB on startup |
| Seeding | On app startup, if key does not exist, reads all users from MongoDB and counts `followed_artists` occurrences per artist |

---

## Example State

After seeding from the ShowTracker test data, the sorted set looks like this:

```
leaderboard:artists:
  "Phoebe Bridgers"  → score: 3
  "Khruangbin"       → score: 3
  "Japanese Breakfast" → score: 3
  "Mitski"           → score: 2
```

When a user follows Mitski, `ZINCRBY leaderboard:artists 1 "Mitski"` updates the score to 3 instantly without touching MongoDB.