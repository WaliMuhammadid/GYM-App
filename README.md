# 🏋️ BEAST-FIT (GYM-App)

Welcome to **BEAST-FIT**, a next-generation AI-powered fitness and gym management application. This project combines a sleek, modern React Native mobile interface with a robust, AI-driven Node.js backend to serve as your ultimate personalized digital fitness coach.

---

## 🚀 Features

### 🧠 FitAI Smart Coach (Gemini Powered)
- **Conversational Intelligence:** Chat naturally with the FitAI Coach, powered by Google's latest **Gemini 3.6-Flash** model.
- **Context-Aware:** The AI knows your current workout schedule, the day of the week, and your fitness goals.
- **Function Calling Engine:** The AI doesn't just give text advice; it actively calls backend functions to **generate and save custom workout routines** directly into your database.
- **Strict Safety Rails:** The coach is programmed to *always* verify your weight, fitness goals, workout frequency, and medical injuries before generating any physical plan.

### 📊 Dashboard & Analytics
- Track your weekly progress, calories burned, and workout consistency.
- View upcoming routines and active exercises dynamically synced with the AI-generated schedules.

### 🛡️ Authentication & Security
- Secure user authentication and protected routes blocking unauthorized access.

---

## 💻 Tech Stack

### Frontend (Mobile App)
- **Framework:** React Native (Expo)
- **Styling:** NativeWind (Tailwind CSS for React Native)
- **Routing:** Expo Router (File-based routing)
- **Language:** TypeScript

### Backend (Server)
- **Framework:** Node.js with Express.js
- **Database:** SQLite (Development)
- **ORM:** Prisma
- **AI Integration:** Google Generative AI SDK (Gemini API)
- **Language:** TypeScript

---

## 🗓️ Development Work Plan & Roadmap

Here is the strategic work plan that guided the development of this application:

### ✅ Phase 1: UI/UX & Foundation
- Design high-fidelity UI mockups (Stitch Interface).
- Initialize Expo project and configure NativeWind/Tailwind.
- Build static screens: Dashboard, Workouts, Nutrition, and Coach interfaces.

### ✅ Phase 2: Backend Architecture
- Initialize Node/Express server.
- Setup Prisma schema modeling `User`, `Routine`, `Exercise`, `RoutineExercise`, and `CoachMessage`.
- Build REST APIs for dashboard stats, workout fetching, and user authentication.
- Implement Auth Guards on the frontend.

### ✅ Phase 3: AI Integration & Polish
- Integrate Gemini API into the `/api/coach/chat` endpoint.
- Develop the "Smart Fitness Fallback Engine" for offline/error handling.
- Implement advanced **Function Calling** (`save_workout_plan`), allowing Gemini to mutate the database.
- Expand token limits for Gemini's "thinking" capabilities.
- Inject real-time DB state (current day, existing routines) into the system prompt.

### ⏳ Phase 4: Future Enhancements (Upcoming)
- Implement real-time macro and nutrition scanning.
- Integrate Push Notifications for workout reminders.
- Deploy backend to a production environment (e.g., Vercel/Render) and migrate to PostgreSQL.
- Publish app to App Store and Google Play Store.

---

## 🛠️ How to Run Locally

### 1. Setup Backend
Navigate to the `server` directory:
```bash
cd server
npm install
```
Create a `.env` file and add your Gemini API Key:
```env
GEMINI_API_KEY="your_api_key_here"
```
Push the database schema and start the server:
```bash
npx prisma db push
npm run dev
```
*(The backend will run on `http://localhost:3000`)*

### 2. Setup Frontend
Open a new terminal and navigate to the `fit_ai_rn` directory:
```bash
cd fit_ai_rn
npm install
```
Create a `.env` file and point it to your backend:
```env
EXPO_PUBLIC_API_URL="http://localhost:3000/api"
```
Run the Expo app:
```bash
npx expo start
```
*(Press `w` to run on web, `a` for Android, or `i` for iOS)*

---

*Built with ❤️ for fitness enthusiasts.*
