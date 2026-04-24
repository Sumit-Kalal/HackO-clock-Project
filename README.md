# 🌿 EcoGuard: Real-Time Wildlife Intelligence System

![Wildlife Monitoring](https://images.unsplash.com/photo-1549333321-12f8d5677f70?auto=format&fit=crop&q=80&w=1200)

## 📖 Project Overview

**EcoGuard** is a production-grade wildlife monitoring and security platform designed for conservationists, park rangers, and researchers. It leverages Google's **Gemini 1.5 Flash** AI to transform raw biological field data (images and videos) into actionable intelligence.

By automating the identification of species and the detection of human activity in protected areas, EcoGuard empowers field teams to protect biodiversity more effectively and respond to threats in real-time.

---

## ⚠️ The Problem

Conservation efforts face several critical bottlenecks:
1.  **Data Overload**: Camera traps generate thousands of hours of footage that take humans weeks to review.
2.  **Delayed Response**: Identifying a poacher or a straying predator days after the event is often too late.
3.  **Identification Accuracy**: Distinguishing between similar species (e.g., different types of wild cats) requires expert knowledge that isn't always available on-site.
4.  **Siloed Data**: Sighting reports are often scattered across notebooks and spreadsheets, making trend analysis nearly impossible.

---

## ✅ The Solution: EcoGuard

EcoGuard provides a centralized, AI-driven hub that solves these issues:
-   **Instant Vision**: High-speed AI scanning of media to identify subjects (Human vs. Animal) and specific species.
-   **Real-Time Analytics**: Live dashboards showing activity trends and system health.
-   **Structured Biodiversity Data**: Every detection is stored in a relational database with metadata (timestamp, location, species identification).
-   **Simplified UI**: A rugged, high-contrast interface designed for professional field use.

---

## 🚀 Key Features

### 1. Intelligence Dashboard
-   **Live Activity Feed**: Visualizing sensor triggers over time using Recharts.
-   **Recent Detections**: A quick-view list of the latest identified subjects.
-   **System Status**: Health checks for AI handshakes and database connectivity.

### 2. AI-Powered Analysis
-   **Multi-Modal Recognition**: Analyzes both static images and MP4/WebM videos.
-   **Species Identification**: Goes beyond simple "animal" detection to identify specific species (e.g., Bengal Tiger, African Elephant).
-   **Human Detection**: Instantly alerts if non-authorized human presence is detected in restricted zones.

### 3. Comprehensive Reports
-   **Biodiversity Distribution**: Pie charts showcasing the ratio of different species detected.
-   **Sighting Velocity**: Bar charts tracking activity peaks across different days.
-   **Data Export Capability**: Organized summaries for conservation reporting.

### 4. Field Media Gallery
-   **Searchable Archives**: Filter footage by detection type (Animal/Human/Unknown).
-   **Detailed Breakdown**: View AI-generated descriptions and confidence scores for every piece of media.

---

## 🛠️ Technical Stack

-   **Frontend**: 
    -   **React 18** (Vite-powered) for a snappy, responsive UI.
    -   **Tailwind CSS** for a bespoke, high-performance design.
    -   **Lucide React** for consistent, professional iconography.
    -   **Recharts** for complex biological data visualization.
-   **Backend**:
    -   **Express.js** handling API routing and media storage.
    -   **SQLite** (via `better-sqlite3`) for robust, local data persistence.
    -   **Multer** for reliable field file uploads.
-   **AI Intelligence**:
    -   **Google Gemini 1.5 Flash**: Utilizing the `@google/genai` SDK for low-latency, high-accuracy vision analysis.

---

## ⚙️ Installation & Local Setup (VS Code)

To run EcoGuard on your local machine:

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher)
- **Git** (if cloning)
- **Gemini API Key**: You MUST have a valid API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### 2. Setup Steps
1.  **Clone/Extract**: Download the source code to your machine.
2.  **Open in VS Code**: Open the project folder.
3.  **Install Packages**:
    ```bash
    npm install
    ```
4.  **Configure Environment**:
    Create a file named `.env` in the root directory (the same place as `package.json`).
    Add your API key exactly like this:
    ```env
    GEMINI_API_KEY=AIzaSy...your_key_here...
    ```
5.  **Launch the System**:
    ```bash
    npm run dev
    ```
6.  **Access the Dashboard**:
    Navigate to `http://localhost:3000` in your browser.

---

## 📁 Authentication
The system comes pre-configured with a default ranger account for local testing:
- **Email**: `ranger@ecoguard.org`
- **Password**: `ranger123`

---

## 🛠️ Internal Workflow (How it Works)

1.  **Media Ingestion**: A ranger uploads field footage through the "Media Gallery".
2.  **AI Handshake**: The server receives the file, converts it to a Base64 stream, and sends it to Gemini 1.5 Flash with a specialized classification prompt.
3.  **JSON Extraction**: Gemini returns a structured JSON response identifying the species and providing a description.
4.  **Data Persistence**: The detection is saved into the SQLite database (`ecoguard.db`).
5.  **UI Sync**: The Dashboard and Reports pages automatically update to reflect the new data.

---

## ❓ Troubleshooting

### "API Key Not Valid"
- Ensure your key starts with `AIza...`.
- Make sure you added it to `.env` (for local use) or the **Secrets** tab (if running in AI Studio).
- Check that there are no extra spaces or quotes around the key.

### "Chart width/height should be greater than 0"
- This usually happens if the CSS container isn't fully rendered before the chart attempts to draw. EcoGuard uses a responsive container with a fixed height fallback of 300px to prevent this issue.

---

*Developed for the future of conservation.* 🌍
