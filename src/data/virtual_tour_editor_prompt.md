# AI Prompt: Build Virtual Tour Editor Component

**Role:** Expert React & TypeScript Developer with experience in WebGL/360 Viewers (Pannellum).

**Task:** Create a comprehensive "Virtual Tour Editor" page/component allows users to upload 360 images, organize rooms, and interactively place hotspots on a panorama.

**Tech Stack:**
- **Frontend:** React, TypeScript, Vite, CSS Modules (or clean CSS).
- **Backend/DB:** Supabase (PostgreSQL).
- **360 Viewer:** Pannellum (using `window.pannellum` directly or a wrapper).
- **State Management:** Local React State management (useState/useReducer).

---

## 1. Feature Requirements

### A. Layout Structure
Create a 3-column layout editor:
1.  **Left Sidebar (Scenes/Rooms List):**
    -   List of uploaded rooms/scenes (thumbnails).
    -   Button to "Add New Room" -> Upload Image Modal.
    -   Ability to reorder rooms (optional, maybe later).
    -   Delete room button.
2.  **Center (The Canvas):**
    -   Large 360 Viewer area (Pannellum).
    -   "Crosshair" in the center of the screen to indicate where a hotspot will be placed if clicked (or allow clicking anywhere to get pitch/yaw).
    -   Toolbar at bottom: "Add Hotspot", "Set Initial View", "Save Tour".
3.  **Right Sidebar (Properties Panel):**
    -   **Room Properties:** Rename room, change initial view.
    -   **Hotspot Properties (When a hotspot is selected):**
        -   **Type:** Info (Tooltip) OR Scene (Navigation).
        -   **Text:** Label text for the hotspot.
        -   **Target Room:** Dropdown to select which room this hotspot leads to (if Type = Scene).
        -   **Icon Style:** Select arrow/info/door icon.
    -   "Delete Hotspot" button.

### B. Functional Logic
1.  **Image Upload:**
    -   Use `react-dropzone` or standard input file.
    -   Upload file to Supabase Storage bucket `tour-images`.
    -   Get public URL and save to `rooms` table.
2.  **Viewer Interaction:**
    -   When user moves camera, track `pitch` and `yaw` in real-time.
    -   **"Add Hotspot" Mode:** When active, clicking on the viewer gets the current `pitch` and `yaw` of the mouse click and creates a new hotspot marker.
3.  **State Management:**
    -   Keep the "Tour Data" (all rooms and hotspots) in a local state object while editing.
    -   Only "Save" to database when the user clicks the "Save Changes" button (Bulk upsert/update to Supabase).

### C. Database Schema Reference
Assume the following Supabase tables exist:
- `tours` (id, title, thumbnail_url)
- `rooms` (id, tour_id, name, image_url, initial_view_pitch, initial_view_yaw)
- `hotspots` (id, room_id, pitch, yaw, type, text, target_room_id, icon)

---

## 2. Implementation Steps

1.  **Setup Supabase Client:** Ensure `src/lib/supabaseClient.ts` is configured.
2.  **Create Components:**
    -   `VirtualTourEditor.tsx` (Main layout).
    -   `SceneList.tsx` (Left sidebar).
    -   `PropertiesPanel.tsx` (Right sidebar).
    -   `Viewer360.tsx` (Wrapper for Pannellum).
3.  **Route:** Add route `/editor/:tourId` to `App.tsx`.

## 3. Desired Code Style
- Use Functional Components with Hooks.
- Use clean, semantic variable names.
- Handle "Loading" states for image uploads.
- **Critical:** Ensure the Pannellum viewer instance is properly destroyed/cleanup on unmount to prevent memory leaks.
