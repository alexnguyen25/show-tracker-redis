# ShowTracker – Redis Commands

## Key
```
leaderboard:artists
```
Sorted set where each member is an artist name and each score is the number of users following that artist.

---

## Initialize

Clear all Redis data and start fresh:
```
FLUSHALL
```

Seed the leaderboard from MongoDB follow data (done automatically on app startup):
```
ZADD leaderboard:artists 3 "Phoebe Bridgers"
ZADD leaderboard:artists 3 "Khruangbin"
ZADD leaderboard:artists 3 "Japanese Breakfast"
ZADD leaderboard:artists 2 "Mitski"
```

Check if the leaderboard key already exists (used to avoid re-seeding):
```
EXISTS leaderboard:artists
```

---

## Create

Add a new artist to the leaderboard with a starting follow count of 0:
```
ZADD leaderboard:artists 0 "New Artist"
```

Add a new artist with a specific score:
```
ZADD leaderboard:artists 5 "Bon Iver"
```

---

## Read

Get all artists ranked from most to least followed (with scores):
```
ZRANGE leaderboard:artists 0 -1 REV WITHSCORES
```

Get the top 3 most followed artists:
```
ZRANGE leaderboard:artists 0 2 REV WITHSCORES
```

Get the follow count (score) for a specific artist:
```
ZSCORE leaderboard:artists "Phoebe Bridgers"
```

Get the rank of a specific artist (0-indexed, highest score = rank 0):
```
ZREVRANK leaderboard:artists "Mitski"
```

Get the total number of artists in the leaderboard:
```
ZCARD leaderboard:artists
```

---

## Update

Increment a follow count by 1 (user follows an artist):
```
ZINCRBY leaderboard:artists 1 "Mitski"
```

Decrement a follow count by 1 (user unfollows an artist):
```
ZINCRBY leaderboard:artists -1 "Mitski"
```

Directly set a new score for an artist:
```
ZADD leaderboard:artists 10 "Phoebe Bridgers"
```

Reset the leaderboard by deleting and re-seeding from MongoDB:
```
DEL leaderboard:artists
ZADD leaderboard:artists 3 "Phoebe Bridgers"
ZADD leaderboard:artists 3 "Khruangbin"
ZADD leaderboard:artists 3 "Japanese Breakfast"
ZADD leaderboard:artists 2 "Mitski"
```

---

## Delete

Remove a specific artist from the leaderboard:
```
ZREM leaderboard:artists "New Artist"
```

Delete the entire leaderboard key:
```
DEL leaderboard:artists
```

Clear all Redis data:
```
FLUSHALL
```

---

## Summary of All Commands Used

| Operation | Command | Description |
|---|---|---|
| Initialize | `FLUSHALL` | Clear all Redis data |
| Seed | `ZADD` | Add artist with follow count score |
| Check exists | `EXISTS` | Avoid re-seeding on startup |
| Read all | `ZRANGE ... REV WITHSCORES` | Get full leaderboard ranked |
| Read top N | `ZRANGE ... REV WITHSCORES` with range | Get top N artists |
| Read score | `ZSCORE` | Get one artist's follow count |
| Read rank | `ZREVRANK` | Get one artist's rank |
| Read count | `ZCARD` | Get total number of artists |
| Increment | `ZINCRBY ... 1` | User follows an artist |
| Decrement | `ZINCRBY ... -1` | User unfollows an artist |
| Update score | `ZADD` | Directly set a new score |
| Remove one | `ZREM` | Remove one artist |
| Delete key | `DEL` | Delete entire leaderboard |