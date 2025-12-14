
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
# MongoDB Atlas Connection String
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/sos_db?retryWrites=true&w=majority

# Initial / fallback admin password
ADMIN_PASSWORD=admin
```

### 4️⃣ Run Locally
```bash
npm run dev
```

Open http://localhost:3000 in your browser.

🔐 **Default Login Password:** `admin`  
(Change it from the **Settings** tab after first login.)

---

## 🔌 Hardware Wiring

### 🔋 Power Strategy

The system uses a **Power Bank Module (IP5306)** as the central power hub:

- **SIM800L:** Powered directly from battery pads (**B+ / B-**) for high current bursts.
- **ESP32:** Powered via **5V USB output** of the power bank module.
- **Common Ground:** All modules must share GND.

⚠️ **Important:** SIM800L must NEVER be powered from 5V.

---

### 🔗 Wiring Table

| Component | Pin | Connects To | Notes |
|---------|-----|-------------|------|
| SIM800L | VCC | Battery (+) | ⚠️ Do NOT use 5V |
| SIM800L | GND | Battery (-) | Common ground |
| SIM800L | TXD | ESP32 GPIO 26 | UART |
| SIM800L | RXD | ESP32 GPIO 27 | UART |
| SIM800L | MIC + / - | External Microphone | Spy Call |
| NEO-6M | VCC | ESP32 3V3 | |
| NEO-6M | GND | ESP32 GND | |
| NEO-6M | TX | ESP32 GPIO 16 | UART |
| NEO-6M | RX | ESP32 GPIO 17 | UART |
| SOS Button | Pin 1 | ESP32 GPIO 4 | Trigger |
| SOS Button | Pin 2 | GND | |

---

## 📡 API Endpoints

The ESP32 communicates with the Next.js backend using JSON APIs.

### ➤ Send Location Update
```
POST /api/device/update
```

Payload:
```json
{
  "lat": 33.6844,
  "lng": 73.0479,
  "type": "GPS",
  "battery": 87
}
```

### ➤ Poll for Commands
```
GET /api/device/poll
```

Response examples:
```json
GET_LOC
```

```json
ACTIVATE_MIC
```

---

## ☁️ Deployment (Vercel)

1. Push code to GitHub
2. Import repository into **Vercel**
3. Add environment variables:
   - `MONGO_URI`
   - `ADMIN_PASSWORD`
4. In **MongoDB Atlas → Network Access**, allow:
```
0.0.0.0/0
```

This allows Vercel to connect to MongoDB.

---

## 📝 License

This project is intended **for educational purposes only**.  
Use responsibly and comply with all applicable laws.

