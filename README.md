
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

🔒 Live Deployment with HTTPS via Let's Encrypt + custom domain

🤖 AI Features:
- Tiered Hints: Context-aware hints (basic → advanced) based on the current problem and your code
- Code Feedback & Review: Post-submission analysis covering approach, complexity, patterns, and improvements
- Explain in Simple Terms: Breaks down problems and solutions into easy-to-understand explanations
- Problem & Test Case Autocomplete (Admin): Assists problem setters by generating problem statements, constrains, examples and test cases

---

## Tech Stack

*  **Frontend**: React + Vite + TailwindCSS
*  **Backend**: Node.js + Express
*  **Compiler**: Node.js microservice
*  **Database**: MongoDB Atlas
*  **Auth**: JWT + Resend (Email verification)
*  **AI Integration**: Google Gemini API
*  **DevOps**: Docker, Docker Compose, Nginx, Oracle Cloud, GitHub Actions, Let's Encrypt


---

## Live Demo

> Visit [https://cj.bymayank.com](https://cj.bymayank.com) to try the hosted version.

> View Demo Video Here: [https://www.loom.com/share/e6c830953e2b41bab19eb78bbc9ddc21](https://www.loom.com/share/e6c830953e2b41bab19eb78bbc9ddc21) *(Note: This demo reflects an earlier version — the app has been significantly updated since.)*

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

* Docker and Docker Compose installed
* MongoDB Atlas cluster
* Oracle Cloud account (Always Free tier) or any Linux VM
* A domain name (optional, required for HTTPS)
* GitHub account (for CI/CD)

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

### 4. Deploy to Oracle Cloud (Always Free)
 
This project is deployed on **Oracle Cloud Always Free** tier — no credit card charges, no expiry.
 
#### VM Setup
 
1. Create an Oracle Cloud account at [oracle.com/cloud/free](https://oracle.com/cloud/free)
2. Create a **VM.Standard.E2.1.Micro** instance (Always Free) with Ubuntu 22.04
3. Open ports **80, 443, 5000** in the Oracle Security List (Networking → VCN → Security Lists)
4. SSH into your VM:
```bash
ssh -i your-key.key ubuntu@YOUR_VM_IP
```
 
5. Install Docker and Docker Compose:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install docker.io -y
sudo usermod -aG docker ubuntu
newgrp docker
```
 
6. Add swap to prevent OOM issues on 1GB RAM:
```bash
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```
 
#### Deploy the App
 
```bash
git clone https://github.com/MayankMohit/Online-Judge-App.git ~/app
cd ~/app
# Create your .env files manually (see step 2)
docker-compose up --build -d
```
 
#### HTTPS with Let's Encrypt
 
1. Point your domain's A record to your VM's public IP
2. Install Certbot and generate a certificate:
```bash
sudo apt install certbot -y
sudo certbot certonly --manual --preferred-challenges dns -d your-domain.com
```
 
3. Update `frontend/nginx.conf` to enable SSL (see the nginx.conf in this repo)
4. Rebuild the frontend container:
```bash
docker-compose up --build -d
```
 
#### Auto-Restart on Reboot
 
```bash
sudo nano /etc/systemd/system/docker-compose-app.service
```
 
```ini
[Unit]
Description=Docker Compose App
Requires=docker.service
After=docker.service
 
[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/ubuntu/app
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
User=ubuntu
 
[Install]
WantedBy=multi-user.target
```
 
```bash
sudo systemctl enable docker-compose-app.service
sudo systemctl start docker-compose-app.service
```
 
---
 
### 5. CI/CD with GitHub Actions
 
Every push to `main` automatically deploys to the VM.
 
Add these secrets to your GitHub repo (**Settings → Secrets → Actions**):
 
| Secret | Value |
|--------|-------|
| `VM_HOST` | Your VM's public IP |
| `VM_SSH_KEY` | Contents of your SSH private key |
 
The workflow (`.github/workflows/deploy.yml`) will SSH into the VM, pull latest code, and rebuild containers automatically.
 
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

###  Competitive Features

* **Contests**: Host and manage timed contests with live leaderboards and real-time feedback.

###  Future Enhancements

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
