# Code Junkie – Full-Stack Online Judge

Code Junkie is a full-stack MERN-based online judge platform with real-time code execution, admin dashboard, and user management. It supports Dockerized microservices and HTTPS deployment with custom domain support.

## Features

- User authentication with email verification (Resend)
- Run and submit code in multiple languages via compiler microservice
- Admin dashboard for managing problems, users, and submissions
- Add/edit/delete problems with test cases and tags
- User performance charts and submission history
- Role-based access control (admin/user)
- Code persistence: Auto-saves user code per problem even after refresh
- Rate limiting on compile and auth endpoints to prevent abuse
- Fully responsive layout for all screen sizes (mobile, tablet, desktop)
- Docker-based microservices with production-ready deployment
- Live deployment with HTTPS via NGINX and Let's Encrypt

## Tech Stack

- Frontend: React + Vite + TailwindCSS
- Backend: Node.js + Express
- Compiler: Node.js microservice
- Database: MongoDB Atlas
- Auth: JWT + Resend (Email verification)
- DevOps: Docker, Docker Compose, NGINX, Certbot, AWS EC2

## Live Demo

Visit [https://cj.bymayank.com](https://cj.bymayank.com) to try the hosted version.

> To self-host this app, follow the setup instructions below and configure your own domain or use `localhost`.

## Project Structure

```
Online-Judge-App/
├── backend/              # Express API
├── frontend/             # React client
├── compiler-service/     # Code execution microservice
├── docker-compose.yml    # Service orchestration
└── README.md
```

## Setup Instructions

### Prerequisites

- AWS EC2 instance or local machine with Docker and Docker Compose
- MongoDB Atlas cluster
- (Optional) Domain name and NGINX for HTTPS

### 1. Clone the Repository

```bash
git clone https://github.com/MayankMohit/Online-Judge-App.git
cd Online-Judge-App
```

### 2. Configure Environment Variables

Create `.env` files for each service:

#### backend/.env

```
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_KEY=your_jwt_secret
RESEND_API_KEY=your_resend_key
CLIENT_URL=http://localhost:5173
COMPILER_URL=http://localhost:5001
```

#### frontend/.env

```
VITE_API_URL=http://localhost:5000
# For production, use your own domain:
# VITE_API_URL=https://your-domain.com
```

#### compiler-service/.env

```
PORT=5001
```

### 3. Build and Start Services

```bash
docker-compose up --build -d
```

### 4. Enable HTTPS (Production)

To enable HTTPS on a domain:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Development Setup (Optional)

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

## Admin Access

To make a user an admin, update their role via dashboard or in the database:

```json
{
  "email": "user@example.com",
  "role": "admin"
}
```

## Roadmap

### 🤖 AI Integration
- **Tiered AI Hints**: Contextual hints (basic → advanced) using problem embeddings and solution similarity.
- **Code Feedback**: LLM-generated feedback after submission — complexity, patterns, anti-patterns, and trade-offs.
- **Bug Detection Assistant**: "Why is my code wrong?" feature with code analysis and test case comparison.
- **AI Code Review**: Automated feedback on readability, modularity, naming, and scoring out of 10.
- **Explain in Layman Terms**: AI-generated problem explanations with analogies, diagrams, and multilingual support.
- **Smart Test Case Generation**: GPT-assisted test case suggestions for problem setters.
- **Plagiarism Detection**: AI-based similarity check between users’ submissions.

### 🏆 Competitive Features
- **Contests**: Host and manage timed contests with live leaderboards and real-time feedback.

### 📈 Future Enhancements
- **Performance Visualization**: Execution trade-off diagrams (radar charts, trees).
- **Submission Insights**: Comparative analysis of multiple approaches for a single problem.

## Contributing

1. Fork the repo
2. Create a branch (`git checkout -b feature/your-feature`)
3. Commit and push
4. Open a pull request

## License

[MIT](./LICENSE)

## Maintainer

Made by [Mayank Mohit](https://github.com/MayankMohit)