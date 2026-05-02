# Notification System Design

## Overview

This system fetches notifications from a backend API, prioritizes them based on type, sorts them by importance and recency, and displays the top notifications to the user.

---

## Data Model

Each notification contains:

- **ID**: Unique identifier
- **Type**: One of `Placement`, `Result`, or `Event`
- **Message**: Notification content
- **Timestamp**: Time of creation

---

## Architecture

### Frontend (React / Next.js)

- Uses a custom hook: `useNotifications`
- Calls internal API route: `/api/notifications`
- Handles:
  - Data fetching
  - Sorting logic
  - Error handling
  - Loading state

### Backend (Next.js API Route)

- Acts as a proxy to external API
- Prevents CORS issues
- Attaches Authorization token if required

---

## Algorithm Logic

### Step 1: Fetch Data

- Fetch notifications from `/api/notifications`

---

### Step 2: Assign Priority Weights

| Type      | Weight |
| --------- | ------ |
| Placement | 3      |
| Result    | 2      |
| Event     | 1      |

---

### Step 3: Sorting Logic

Notifications are sorted based on:

1. **Priority (Descending)**
2. **Timestamp (Most recent first)**

#### Sorting Implementation:

```javascript
notifs.sort((a, b) => {
  const wA = weights[a.Type] || 0;
  const wB = weights[b.Type] || 0;

  if (wA !== wB) return wB - wA;

  return new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime();
});
```

---

### Step 4: Limit Results

- Only top **10 notifications** are displayed

```javascript
setNotifications(notifs.slice(0, limit));
```

---

## State Management

The hook maintains:

- `notifications`: Final sorted list
- `loading`: Boolean for API state
- `error`: Error message if fetch fails

---

## Error Handling

- Checks API response status
- Catches network or parsing errors
- Displays error message

---

## Time Complexity

- Sorting complexity: **O(n log n)**
- Slicing: **O(k)** where k = 10

---

## Optimization (Future Scope)

Instead of sorting entire dataset:

- Use **Min Heap of size 10**
- Complexity reduces to: **O(n log k)**

---

## Advantages

- Efficient prioritization of important notifications
- Clean separation of concerns (API + UI)
- Reusable custom hook
- Handles real-time refresh via `refetch`

---

## Conclusion

The system ensures that users always see the most important and recent notifications by combining priority-based sorting with time-based ordering, providing an efficient and scalable solution.
