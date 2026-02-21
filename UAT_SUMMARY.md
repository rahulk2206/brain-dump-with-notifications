# Brain Dump – UAT Summary

Summary of testing and fixes applied before publish.

---

## Functional Fixes

### 1. **Goals category**
- **Issue:** "Goal" was in the quick-capture buttons but missing from the filter bar and stats, so goals couldn’t be filtered and weren’t counted.
- **Fix:** Added "Goal" to the filter bar, added a "Goals" stat card with count, and set the stats grid to 2/3/6 columns (mobile/tablet/desktop) so all six stats (Ideas, Tasks, Notes, Goals, Done, Archived) fit.

### 2. **Calendar and due dates (timezone)**
- **Issue:** Due dates were stored as full ISO strings (UTC). Calendar compared using local date vs UTC date string, so items could appear on the wrong day (e.g. in PST, an item due “Feb 17” could show on Feb 16 or 18).
- **Fix:**
  - Due dates are now stored as **local date strings** (`YYYY-MM-DD`) from the date input.
  - Added `toLocalDateString()` and use it for both calendar days and item dates so comparison is consistent.
  - List view due-date display uses noon local time when rendering a date string to avoid off-by-one display.

### 3. **Empty state when filters return no results**
- **Issue:** When there were items but search/filter returned none, the app showed “Your mind is clear,” which was misleading.
- **Fix:** Empty state now depends on whether any items exist: if there are items but none match, show “No items match your filters” and “Try adjusting your search or filter to see more items.” with a search icon.

### 4. **Dark mode / collaboration flash on load**
- **Issue:** `darkMode` and `collaborationMode` were read in `useEffect` after first paint, so the app could briefly show light mode (and wrong collaboration state) then switch.
- **Fix:** Both are initialized from `localStorage` in `useState( () => { ... } )` so the first render uses the saved preference and the flash is removed.

---

## UX & Accessibility

### 5. **Header on small screens**
- **Issue:** Left (Team + Calendar) and right (Dark mode) buttons were absolutely positioned and could overlap the title on narrow viewports.
- **Fix:** Header layout is responsive: on small screens the left group is centered above the title; on `sm+` it’s back to absolute left. Title size steps down on small screens (`text-5xl` → `text-6xl` → `text-7xl`).

### 6. **Touch targets**
- **Issue:** Some controls were smaller than the recommended 44px minimum touch target.
- **Fix:** Added a `.touch-target` class (min 44×44px) and applied it to primary actions: header buttons, “Save as” category buttons, filter bar (All/Idea/Task/Note/Goal, Show Archived, Export), Set due date, and per-item actions (complete, archive, delete). Small inline actions (e.g. remove tag) keep compact layout but get improved focus styling.

### 7. **Focus and keyboard**
- **Fix:** `:focus-visible` styles added for buttons, inputs, and textarea (amber outline, 2px, offset). Tag-remove button uses `focus-visible:ring-2 ring-amber-400` and `aria-label` for remove-tag action.

### 8. **ARIA and labels**
- **Fix:** Added `aria-label` where useful (e.g. “Switch to calendar/list view”, “Switch to light/dark mode”, “Archive”/“Unarchive”, “Delete”, “Remove tag X”) and `aria-pressed` for the collaboration toggle.

---

## Aesthetic Polish

### 9. **Glass panels**
- Slightly stronger glass (opacity, blur 12px, `-webkit-backdrop-filter`), softer border, and light shadow so panels read better in light and dark mode.

### 10. **Stat cards**
- Hover uses a subtle shadow lift in addition to the existing transform so hover state is clearer.

### 11. **Gradient and background**
- “Brain Dump” gradient text updated to a clearer blue–purple range and tighter letter-spacing.
- Light-mode background softened to `from-slate-50 via-amber-50/30 to-orange-50` for a warmer, less harsh look.

### 12. **Item cards and interactions**
- Item cards use `duration-300` and `hover:shadow-xl` for a consistent, smooth hover.
- Tag remove control has padding and hover state (`hover:bg-red-500/20`, `hover:text-red-500`) for clearer affordance.

### 13. **Selection and tap**
- `::selection` uses an amber tint in light and dark mode.
- `-webkit-tap-highlight-color: transparent` on `body` to avoid default tap flash while keeping focus/visible styles.

---

## Files Updated

- **`index.html`** – All logic, layout, and style changes above.
- **`www/index.html`** – Synced from `index.html` for Capacitor (iOS/Android) builds.

---

## Suggested Manual Checks Before Publish

1. **Add items** – Create at least one Idea, Task, Note, and Goal; confirm they show in the list and in the correct stat.
2. **Filter** – Use All, Idea, Task, Note, Goal and confirm only that type shows.
3. **Search** – Type in the search box and confirm list updates; clear and confirm “No items match your filters” when nothing matches.
4. **Due date** – Set a due date, save; confirm it appears on the correct day in Calendar view and shows the correct date in the list.
5. **Archive / complete** – Archive and complete items; confirm counts and “Show Archived” behavior.
6. **Dark mode** – Toggle dark mode; reload the page and confirm no flash and that preference persists.
7. **Export** – Export JSON and confirm it contains your items.
8. **Mobile** – Resize to a narrow width (or use device toolbar) and confirm header and stat grid don’t overlap and primary buttons are easy to tap.

After these, the app is in good shape for release.
