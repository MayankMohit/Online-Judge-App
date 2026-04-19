
# Code Junkie – Full-Stack Online Judge😍🧑‍💻

Code Junkie is a full-stack MERN-based online judge platform with real-time code execution, admin dashboard, and user management. It supports Dockerized microservices and HTTPS deployment with custom domain support.

## Features

📩 User Authentication with email verification (via Resend)

💻 Run & Submit Code in multiple languages in a sandboxed environment

🛠️ Admin Dashboard for managing problems, users, and submissions

📝 Add/Edit/Delete Problems with test cases and tags

🛡️ Role-Based Access Control (admin/user/guest)

💾 Code Persistence: Auto-saves user code per problem even after refresh

🚫 Rate Limiting on compile and auth endpoints to prevent abuse

📱 Fully Responsive Layout for all screen sizes (mobile, tablet, desktop)

🐳 Docker-Based Microservices with production-ready deployment

🔒 Live Deployment with HTTPS via Railway (automatic TLS)

🤖 AI Features:
- Tiered Hints: Context-aware hints (basic → advanced) based on the current problem and your code
- Code Feedback & Review: Post-submission analysis covering approach, complexity, patterns, and improvements
- Explain in Simple Terms: Breaks down problems and solutions into easy-to-understand explanations
- Problem & Test Case Autocomplete (Admin): Assists problem setters by generating problem statements, constrains, examples and test cases

---

## Tech Stack

* 💻 **Frontend**: React + Vite + TailwindCSS
* 🛠️ **Backend**: Node.js + Express
* ⚙️ **Compiler**: Node.js microservice
* 🗄️ **Database**: MongoDB Atlas
* 🔐 **Auth**: JWT + Resend (Email verification)
* 🤖 **AI Integration**: Google Gemini API
* 🚀 **DevOps**: Docker, Docker Compose, Railway


---

## Live Demo

>🌐  Visit [https://cj.bymayank.com](https://cj.bymayank.com) to try the hosted version.

> 📽️ View Demo Video Here: [https://www.loom.com/share/e6c830953e2b41bab19eb78bbc9ddc21](https://www.loom.com/share/e6c830953e2b41bab19eb78bbc9ddc21) *(Note: This demo reflects an earlier version — the app has been significantly updated since.)*

> To self-host this app, follow the setup instructions below and configure your own domain or use `localhost`.

---


## Project Structure

```
Online-Judge-App/
├── backend/              # Express API
├── frontend/             # React client
├── compiler-service/     # Code execution microservice
├── docker-compose.yml    # Service orchestration
└── README.md
```

---

## Setup Instructions

### Prerequisites

* Railway account (for cloud deployment) or local machine with Docker and Docker Compose
* MongoDB Atlas cluster
* (Optional) Custom domain for Railway deployment

---

### 1. Clone the Repository

```bash
git clone https://github.com/MayankMohit/Online-Judge-App.git
cd Online-Judge-App
```

---

### 2. Configure Environment Variables

Create `.env` files for each service:

#### backend/.env

```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_KEY=your_jwt_secret
RESEND_API_KEY=your_resend_key
CLIENT_URL=http://localhost:5173
COMPILER_URL=http://localhost:5001
GEMINI_API_KEY=your_api_key
```

#### frontend/.env

```env
VITE_API_URL=http://localhost:5000
# For production, use your Railway domain or custom domain:
# VITE_API_URL=https://your-domain.com
```

#### compiler-service/.env

```env
PORT=5001
```

---

### 3. Build and Start Services (Local)

```bash
docker-compose up --build -d
```

---

### 4. Deploy to Railway

Railway automatically handles HTTPS and TLS for all deployments.

1. Push your code to GitHub
2. Create a new Railway project and connect your repository
3. Add each service (backend, frontend, compiler-service) as a separate Railway service
4. Set environment variables for each service via the Railway dashboard
5. (Optional) Add a custom domain under **Settings → Domains** — Railway provisions HTTPS automatically

---

## Development Setup

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Compiler Service

```bash
cd compiler-service
npm install
npm run dev
```

---

## Admin Access

To make a user an admin, update their role via dashboard or in the database:

```json
{
  "email": "user@example.com",
  "role": "admin"
}
```

---

## Roadmap

### 🏆 Competitive Features

* **Contests**: Host and manage timed contests with live leaderboards and real-time feedback.

### 📈 Future Enhancements

* **Performance Visualization**: Execution trade-off diagrams (radar charts, trees).
* **Submission Insights**: Comparative analysis of multiple approaches for a single problem.

---

## Contributing

1. Fork the repo
2. Create a branch (`git checkout -b feature/your-feature`)
3. Commit and push
4. Open a pull request

---

## License

[MIT](./LICENSE)

---

## Maintainer

Made by [Mayank Mohit](https://github.com/MayankMohit)

---
