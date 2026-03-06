# SteadLog

> A mobile-first homestead memory system for action logging and long-term recall

[![Deploy to Production](https://github.com/bitscon/homestead-architect-game/actions/workflows/deploy.yml/badge.svg)](https://github.com/bitscon/homestead-architect-game/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Live Application:** [https://myhome.homesteadarchitect.com](https://myhome.homesteadarchitect.com)  
**Marketing Site:** [https://homesteadarchitect.com](https://homesteadarchitect.com)

---

## 🌟 Features

SteadLog helps small and part-time homesteaders capture what they did, when they did it, and what happened:

- **⚡ Quick Log Flow** - Tap category, enter action, save in seconds
- **🕓 SteadLog Timeline** - Chronological history of homestead actions, reminders, and milestones
- **📡 Offline-First Logging** - Queue logs locally and sync automatically when connectivity returns
- **📸 Photo Attachments** - Capture and attach media to HomesteadAction records
- **🎤 Voice-Assist Input** - Optional voice input for faster hands-busy logging
- **🔔 Reminder Engine** - Action-linked reminders for follow-up tasks and care events
- **📱 Barn-First UX** - Mobile-first interface built for one-hand use in field conditions

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+ and npm 10+
- **Docker** 20.10+ and Docker Compose 1.29+
- **Supabase** account (for backend services)

### Local Development

```bash
# Clone the repository
git clone https://github.com/bitscon/homestead-architect-game.git
cd homestead-architect-game

# Copy environment template
cp .env.example .env.dev

# Add your Supabase credentials to .env.dev
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_ANON_KEY=your_anon_key

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at [http://localhost:5173](http://localhost:5173)

### Docker Development

For a production-like environment with hot reload:

```bash
# Start all development services
docker-compose --profile dev up -d

# Or start specific services
docker-compose --profile dev up -d frontend-dev postgres

# View logs
docker-compose logs -f frontend-dev

# Stop services
docker-compose --profile dev down
```

**Available profiles:**
- `dev` - Development environment (frontend-dev + postgres)
- `production` - Production build (frontend-prod only)
- `tools` - Database admin tools (pgadmin)

---

## 🏗️ Tech Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite 5
- **UI Components:** shadcn/ui (Radix UI + Tailwind CSS)
- **State Management:** React Context + TanStack Query
- **Routing:** React Router v6
- **Forms:** React Hook Form + Zod validation

### Backend
- **Database:** PostgreSQL (via Supabase)
- **Authentication:** Supabase Auth
- **Real-time:** Supabase Realtime subscriptions
- **Storage:** Supabase Storage (for images/documents)

### DevOps
- **Containerization:** Docker + Docker Compose
- **CI/CD:** GitHub Actions
- **Image Registry:** GitHub Container Registry (GHCR)
- **Hosting:** OVH VPS with Plesk
- **Proxy:** Nginx (managed by Plesk)

---

## 📦 Project Structure

```
homestead-architect/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions CI/CD
├── public/                     # Static assets
├── scripts/                    # Utility scripts
│   ├── init-db.sql            # Database initialization
│   └── validate-supabase-prod.mjs
├── src/
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   └── game/             # Gamification components
│   ├── contexts/             # React contexts
│   ├── features/             # Feature modules
│   │   ├── animals/
│   │   ├── crops/
│   │   ├── finance/
│   │   ├── goals/
│   │   ├── health/
│   │   ├── infrastructure/
│   │   ├── inventory/
│   │   ├── journal/
│   │   └── tasks/
│   ├── game/                 # Gamification logic
│   ├── hooks/                # Custom React hooks
│   ├── integrations/         # External service integrations
│   │   └── supabase/
│   ├── lib/                  # Utility functions
│   ├── pages/                # Route components
│   └── types/                # TypeScript types
├── docker-compose.yml        # Docker services configuration
├── Dockerfile                # Production build
├── Dockerfile.dev            # Development build
└── [documentation files]
```

### 🛠️ Project Management

We use **GitHub Issues** as a comprehensive project management system:

**📋 Project Board:** [github.com/bitscon/homestead-architect-game/projects](https://github.com/bitscon/homestead-architect-game/projects)  
**📝 Issues List:** [github.com/bitscon/homestead-architect-game/issues](https://github.com/bitscon/homestead-architect-game/issues)  
**📊 Templates & Guides:** [PROJECT_MANAGEMENT_SETUP.md](PROJECT_MANAGEMENT_SETUP.md) | [FIRST_PROJECT_ISSUE.md](FIRST_PROJECT_ISSUE.md) | [GITHUB_QUICK_START.md](GITHUB_QUICK_START.md)

**🏷️ Issue Labels:**  
- 🏗️ Infrastructure (VPS, Docker, deployment)  
- ✨ Feature (new functionality)  
- 🐛 Bug (fixes and errors)  
- 📝 Documentation (guides, README)  
- 🚀 Deployment (CI/CD, releases)  
- 🎯 Goal (milestones, objectives)  
- ✅ Testing (QA, test coverage)  
- 📊 Performance (optimization, speed)  
- 🔍 Investigation (research, debugging)

**💡 Workflow:** Feature request → Development → Testing → Production

---

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev              # Start Vite dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript compiler check

# Docker
docker-compose --profile dev up -d         # Start dev environment
docker-compose --profile production up -d  # Start production build
docker-compose --profile tools up -d       # Start pgadmin
```

### Environment Variables

Create `.env.dev` for local development:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Application Settings
VITE_APP_NAME=SteadLog (Dev)
VITE_SHOW_GAME_DEBUG=true

# Optional: Local PostgreSQL (if using Docker)
POSTGRES_DB=homestead_dev
POSTGRES_USER=homestead_user
POSTGRES_PASSWORD=homestead_password
```

See `.env.example` for all available options.

---

## 🚢 Production Deployment

### Infrastructure

**Production Server:**
- **VPS:** vps-5385eb51.vps.ovh.us (OVH Cloud)
- **DNS:** bitscon.net → 15.204.225.161
- **Application:** Docker Compose on port 8082
- **Proxy:** Plesk/Nginx → myhome.homesteadarchitect.com
- **Database:** Supabase at supabase.bitscon.net

### What to Expect

> **Quick Reference:** Before deploying, [monitor the workflow](https://github.com/bitscon/homestead-architect-game/actions)

**Deployment Process:**
1. **Build & Push** (~2-3 min): GitHub builds Docker image and pushes to GHCR
2. **Deploy** (~1-2 min): SSH to production server and starts containers
3. **Health Check** (~15 sec): Validates app is responding on port 8082

**Success Indicators:**
- ✅ "Build and push Docker image" (green checkmark)
- ✅ "Containers are running" 
- ✅ "Health check passed - Application responding on port 8082"
- ✅ "Deployment completed successfully!"

**Access After Deployment:**
- **Local test:** `curl http://localhost:8082` (on production server)
- **Public URL:** `https://myhome.homesteadarchitect.com` (after Plesk proxy)

**If Issues Occur:**
- 🔴 "Docker command failed" - Check container logs
- 🔴 "Health check failed" - App not responding on port 8082
- 🔴 "SSH connection failed" - Check GitHub secrets configuration

### Automated Deployment (Recommended)

We use GitHub Actions for automated deployments:

1. Navigate to [Actions](https://github.com/bitscon/homestead-architect-game/actions)
2. Select **"Deploy to Production"** workflow
3. Click **"Run workflow"**
4. Type `deploy` to confirm
5. Select log level (`info` or `debug`)
6. Click **"Run workflow"**

**Deployment Process:**
1. Build Docker image from source
2. Push to GitHub Container Registry
3. SSH to production VPS
4. Pull latest image
5. Deploy with Docker Compose
6. Run health checks
7. Report success/failure

**Timeline:** ~3-4 minutes

### Manual Deployment

For emergency deployments or when GitHub Actions is unavailable:

```bash
# SSH to production
ssh billybs@vps-5385eb51.vps.ovh.us

# Navigate to app directory
cd /opt/apps/homestead-architect-game

# Pull latest code
git pull origin main

# Deploy
sudo docker-compose -f docker-compose.yml --profile production up -d

# Verify
curl http://localhost:8082
sudo docker-compose -f docker-compose.yml --profile production ps
```

### Rollback Procedure

If a deployment causes issues:

```bash
# SSH to production
ssh billybs@vps-5385eb51.vps.ovh.us
cd /opt/apps/homestead-architect-game

# Find previous commit
git log --oneline -5

# Rollback code
git checkout <previous-commit-hash>

# Rebuild and deploy
sudo docker-compose -f docker-compose.yml --profile production up -d --build

# Verify
curl http://localhost:8082
```

---

## 📚 Documentation

Comprehensive documentation is available in the repository:

| Document | Description |
|----------|-------------|
| [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) | Complete deployment guide with troubleshooting |
| [DEPLOYMENT_PLAYBOOK.md](DEPLOYMENT_PLAYBOOK.md) | Quick reference for deployment procedures |
| [DOCKER_DEVELOPMENT.md](DOCKER_DEVELOPMENT.md) | Docker development environment setup |
| [SSH_SETUP_GUIDE.md](SSH_SETUP_GUIDE.md) | SSH key configuration for GitHub Actions |
| [CHANGELOG.md](CHANGELOG.md) | Version history and release notes |
| [AGENTS.md](AGENTS.md) | AI agent development guidelines |

---

## 🎮 Gamification System

SteadLog includes a built-in gamification system to make farm management engaging:

- **Experience Points (XP):** Earn XP for completing tasks, logging entries, and achieving goals
- **Levels:** Progress through levels as you earn XP
- **Achievements:** Unlock badges for milestones and accomplishments
- **Leaderboard:** See how you compare with other homesteaders (optional)
- **Streaks:** Maintain daily activity streaks for bonus XP

---

## 🛡️ Security

- **Authentication:** Supabase Auth with JWT tokens
- **Authorization:** Row Level Security (RLS) policies in Supabase
- **API Security:** All endpoints require authentication
- **Input Validation:** Zod schemas validate all user inputs
- **Environment Variables:** Secrets never committed to repository
- **HTTPS:** All production traffic encrypted via Plesk/Let's Encrypt

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `chore:` - Maintenance tasks
- `refactor:` - Code refactoring
- `test:` - Test updates

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **shadcn/ui** - Beautiful and accessible component library
- **Supabase** - Backend as a Service platform
- **Vite** - Lightning-fast build tool
- **React** - UI framework
- **Tailwind CSS** - Utility-first CSS framework

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/bitscon/homestead-architect-game/issues)
- **Discussions:** [GitHub Discussions](https://github.com/bitscon/homestead-architect-game/discussions)
- **Email:** support@homesteadarchitect.com (coming soon)

---

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Offline mode with sync
- [ ] Weather integration
- [ ] Market price tracking
- [ ] Community sharing features
- [ ] Multi-farm management
- [ ] Advanced analytics dashboard
- [ ] Integration with farming hardware/IoT

---

**Built with ❤️ for homesteaders, by homesteaders**
