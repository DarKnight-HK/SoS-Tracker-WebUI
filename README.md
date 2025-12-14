# 🛰️ SoS Tracker – Advanced IoT Tracking Platform

> A full-stack, real-time GPS tracking solution with **Spy Call** capabilities, indoor **LBS fallback**, and a **secured admin dashboard**.

---

## ✨ Features

- **Real-Time Tracking**  
  Live GPS positioning visualized on a dark-mode interactive map.

- **Indoor Fallback (LBS)**  
  Automatically switches to Cell Tower triangulation when GPS is unavailable (e.g., indoors, basements).

- **Spy Call 📞**  
  Remotely trigger the device to silently call your phone and listen to surroundings.

- **Secure Dashboard**  
  Password-protected admin console with credentials stored securely in MongoDB.

- **Location History**  
  Track movement history with timestamps and battery-level logs.

- **Remote Commands**  
  Send commands wirelessly (force location update, activate mic, etc.).

- **Mobile-First Design**  
  Fully responsive UI with slide-out sidebar optimized for phones.

---

## 🛠️ Tech Stack

### 💻 Software
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** MongoDB Atlas (Mongoose)
- **Styling:** Tailwind CSS + ShadCN UI
- **Maps:** Leaflet / React-Leaflet
- **Deployment:** Vercel

### 🔧 Hardware
- **Microcontroller:** ESP32 DevKit V1
- **GSM Module:** SIM800L (2G)
- **GPS Module:** NEO-6M
- **Power:** 18650 Li-Ion Battery + Power Bank Module (IP5306)

---

## 🚀 Getting Started (Software)

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/sos-tracker.git
cd sos-tracker
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Environment Variables

Create a file named **.env.local** in the project root:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/sos_db?retryWrites=true&w=majority
ADMIN_PASSWORD=admin
```

### 4️⃣ Run Locally
```bash
npm run dev
```

---

## ☁️ Deployment

Optimized for **Vercel**.  
Add environment variables and allow `0.0.0.0/0` in MongoDB Atlas Network Access.

---

## 📝 License

Educational purposes only.
