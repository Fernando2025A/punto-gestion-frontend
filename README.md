# 📊 Punto Gestión

> A modern web-based inventory and stock management system designed to streamline product tracking, inbound/outbound movements, and key business analytics.

---

## 🚀 Key Features

* **Interactive Dashboard:** Real-time business overview featuring metrics like total products, inventory valuation, critical stock alerts, and weekly trends.
* **Inventory Control:** Complete tracking of inbound/outbound stock movements and automated alerts for **low stock** items.
* **Authentication Flow:** Built-in sign-in (*Username/Password* & Google integration) and user registration for secure access.
* **Modern Dark UI:** Clean, responsive, and easy-to-read interface optimized for quick data visualization.

---

## 🛠️ Tech Stack

* **Frontend:** [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
* **Bundler & Build Tool:** [Vite](https://vitejs.dev/)
* **Icons:** [Lucide React](https://lucide.dev/)
* **Routing:** [React Router](https://reactrouter.com/)
* **Styling:** Native CSS3 (CSS Variables & Responsive Design)

---

## 💻 Prerequisites

Ensure you have the following installed locally:

* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* `npm` or `yarn`

---

## ⚙️ Getting Started

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/punto-gestion.git](https://github.com/your-username/punto-gestion.git)
   cd punto-gestion

---

## Install Dependencies
  Bash
  npm i

---

## Environment Variables:
  Create a .env file in the root directory based on .env.example (or set your backend API URL):
  VITE_API_URL=http://localhost:3000

---

## Run the development server:

Bash
npm run dev

---

## Available ScriptsIn the project directory, you can run:
Command         Description
npm run dev     Starts the local development server with HMR.
npm run build   Bundles the app into static files for production in the dist folder.
npm run preview Locally previews the production build.
npm run lint    Runs ESLint to inspect and catch code issues.

## Project Structure
punto-gestion/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Application views (Login, Register, Dashboard, etc.)
│   ├── assets/          # Static assets, images, and icons
│   ├── App.tsx          # Main routing & application configuration
│   └── main.tsx         # React entry point
├── .env                 # Local environment variables
├── package.json         # Project dependencies and scripts
└── README.md            # Project documentation