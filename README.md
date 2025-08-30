

<h1 align="center">🛡️ CyberShield AI</h1>

<p align="center">
  <strong>Your Personal Command Center for Digital Sovereignty</strong>
  <br />
  <br />
  <a href="https://cybershieldai01.netlify.app/"><strong>View Live Demo »</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/build-passing-brightgreen" alt="Build Status">
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT">
  <img src="https://img.shields.io/badge/version-1.0.0-lightgrey.svg" alt="Version">
</p>

---

> CyberShield AI is a next-generation, enterprise-grade threat intelligence platform designed to transform personal cybersecurity from a passive, reactive chore into an empowered, proactive command operation. It provides users with a real-time, unified view of their digital threat landscape, powered by a live, collective defense network.

<br>

---

## ✨ Key Features

CyberShield AI is built around a core set of powerful, integrated features designed to provide unparalleled security insight and control.

🧠 **Project Oracle: The Security Analysis Engine**
- **Multi-Vector Threat Analysis:** Performs a deep, forensically-sound analysis of any URL.
- **Authoritative Intelligence:** Integrates directly with world-class, industry-standard APIs including VirusTotal, Google Safe Browsing, and AbuseIPDB to deliver factually accurate verdicts.
- **Defensible Trust Score:** Generates a weighted, evidence-based "Trust Score" (0-100) based on validated data points like domain age, SSL/TLS integrity, and consensus from over 70 security vendors.

🌐 **The Live Collective Defense Network**
- **Community-Powered Intelligence:** Users can report suspicious URLs and activities, contributing to a shared intelligence grid.
- **Real-Time Hardening:** Powered by **Supabase Realtime Subscriptions**, every verified threat report instantly hardens the defenses for the entire user community.
- **Self-Improving Network Effect:** The system creates a powerful, "digital immune system" that learns and evolves with every new threat.

📊 **AI-Powered Threat Analytics**
- **Predictive Insights:** Leverages AI to identify emerging threat patterns, trend shifts, and anomalous activity on a global scale.
- **Actionable Intelligence:** Provides users with clear, concise insights into the current threat landscape.
- **Performance Metrics:** Displays key AI model performance metrics like prediction accuracy and response time, ensuring transparency and trust.

---

## 🚀 Technology Stack

Our platform is built on a modern, scalable, and high-performance technology stack, chosen for reliability and speed.

| Category               | Technology                                                                                                  |
| ---------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Frontend** | `React`, `Vite`, `TypeScript`, `shadcn/ui`, `Tailwind CSS`                                                    |
| **Backend & Database** | `Supabase` (Serverless), `Postgres`, `Realtime Subscriptions`, `Supabase Auth`                                |
| **Intelligence Engine**| A `Supabase Edge Function` integrating `VirusTotal`, `Google Safe Browsing`, `AbuseIPDB`, and `WHOIS` APIs. |

---

## 🔧 Getting Started & Setup

To run this project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/Prathamlm30/CyberShieldAI.git]
    cd cybershield-ai
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Secrets:**
    Create a `.env.local` file in the root of the project and add your Supabase and third-party API keys.
    ```
    VITE_SUPABASE_URL=[https://nhmgbrdyaciukdfnwrku.supabase.co]
    VITE_SUPABASE_ANON_KEY=sb_publishable_WwHpPAZvM6gXu6qRwbAcQA_1xaLpf9Q
    ```
    *(Note: All intelligence engine API keys must be configured as secrets directly within your Supabase Edge Function for security.)*

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

---

## 💡 The "Why": The Paradigm Shift

Legacy antivirus is a losing battle. It's reactive, slow, and defenseless against modern threats. **CyberShield AI** was built to change this paradigm. We believe that true digital security comes from empowerment, real-time intelligence, and collective defense. Our mission is to democratize access to the elite, enterprise-grade security tools that were previously out of reach for everyday users and small businesses, creating a safer and more resilient internet for everyone.

---

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.
