<div align="center">
<img width="1200" height="475" alt="SoussMassa RH" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🚀 SoussMassa RH - Regional Recruitment Platform

An AI-powered recruitment platform for the Souss-Massa region, connecting talents with enterprises using intelligent matching technology.

## ✨ Features

- 🤖 **AI-Powered Matching** - Gemini API integration for smart candidate-job matching
- ☁️ **Cloud Native** - Built on AWS infrastructure (Lambda, S3, Cognito, DynamoDB)
- 📄 **Secure CV Management** - Encrypted file storage with S3
- 👥 **Multi-role System** - Separate dashboards for candidates and companies
- 🔐 **Enterprise Security** - HTTPS, CORS, CSRF protection, input sanitization
- ⚡ **Performance Optimized** - React 19, Vite, Code splitting, CDN delivery
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client (React + Vite)                 │
│                   ├─ Pages (Auth, Jobs, Dashboard)         │
│                   ├─ Services (API, Gemini, Auth)          │
│                   └─ Components (Reusable UI)              │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTPS + CORS
                             ▼
┌─────────────────────────────────────────────────────────────┐
│              AWS API Gateway (REST API)                     │
│         ├─ /auth (Login, Register, JWT)                    │
│         ├─ /jobs (CRUD operations)                         │
│         ├─ /applications (Job applications)                │
│         └─ /cv (Signed URL generation)                     │
└────────┬──────────────┬──────────────┬──────────────┬───────┘
         │              │              │              │
         ▼              ▼              ▼              ▼
    Lambda         Lambda          Lambda         Lambda
    Functions      Functions       Functions      Functions
         │              │              │              │
    ┌────┴──────────────┴──────────────┴──────────────┴────┐
    │                   AWS Services                       │
    ├─ S3 (CV Storage, Web Hosting)                      │
    ├─ DynamoDB (Jobs, Applications, Users)              │
    ├─ Cognito (Authentication)                          │
    ├─ CloudFront (CDN, HTTPS, Caching)                  │
    ├─ CloudWatch (Logging, Monitoring)                  │
    └─ Secrets Manager (API Keys, Credentials)           │
```

## 🚨 Critical Issues & Fixes

### ⚠️ SECURITY: Exposed Gemini API Key

**Status:** 🔴 CRITICAL

The Gemini API key is currently exposed in `.env.local`. This must be revoked immediately:

```bash
# 1. Revoke the exposed key from Google Cloud Console
# 2. Generate a new API key
# 3. Update .env.local with the new key
# 4. NEVER commit .env files to git
```

### 🔴 S3 Access Denied Error

**Status:** CRITICAL - Needs Configuration

The S3 bucket requires proper CORS and policy configuration:

```bash
# Apply CORS configuration
aws s3api put-bucket-cors --bucket soussmassa-rh-cv-coffre \
  --cors-configuration '{
    "CORSRules": [{
      "AllowedMethods": ["GET", "PUT", "POST"],
      "AllowedOrigins": ["*"],
      "AllowedHeaders": ["*"]
    }]
  }' --region eu-west-3
```

See **EXPERT_REVIEW.md** for complete issue analysis and solutions.

## 📋 Prerequisites

- **Node.js** 16+ (Check with `node --version`)
- **npm** 7+ or **yarn**
- **AWS Account** with configured credentials
- **Google Gemini API Key** from https://aistudio.google.com/
- **Bash** or **PowerShell** for deployment scripts

## 🚀 Quick Start

### 1. Setup (First Time)

```bash
# Windows (PowerShell)
powershell -ExecutionPolicy Bypass -File .\fix-and-configure.ps1

# macOS/Linux
chmod +x fix-and-configure.ps1 && ./fix-and-configure.ps1
```

This script will:
- Validate Node.js and npm installations
- Create necessary directories
- Secure environment files
- Install dependencies

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your values
# VITE_API_BASE_URL=https://your-api-id.execute-api.eu-west-3.amazonaws.com/V1
# VITE_AWS_S3_BUCKET=soussmassa-rh-cv-coffre
# API_KEY=YOUR_GEMINI_API_KEY
```

### 3. Development

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:3000)
npm run dev

# Type checking
npm run type-check

# Security audit
npm run security-check
```

### 4. Testing

```bash
# Run tests (when configured)
npm run test

# Validate everything
npm run validate
```

## 🌐 Deployment

### Development Deployment

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Production Deployment to AWS

```bash
# Step 1: Setup AWS infrastructure
bash setup-aws.sh

# Step 2: Deploy to S3 and CloudFront
bash deploy.sh

# Or in one command
npm run prod-deploy
```

See **deploy.sh** and **setup-aws.sh** for detailed deployment process.

## 📚 Documentation

- **[EXPERT_REVIEW.md](./EXPERT_REVIEW.md)** - Comprehensive cloud & dev review with 18 identified issues and fixes
- **[IMPROVEMENTS.md](./IMPROVEMENTS.md)** - Code quality improvements applied to the project
- **[deploy.sh](./deploy.sh)** - Production deployment script with validation
- **[setup-aws.sh](./setup-aws.sh)** - AWS infrastructure setup automation

## 🔐 Security Checklist

Before going to production:

- [ ] Remove all hardcoded API keys
- [ ] Add .env.local to .gitignore
- [ ] Enable HTTPS/SSL certificate
- [ ] Configure S3 bucket CORS and policies
- [ ] Set up CloudFront distribution
- [ ] Enable CloudWatch logging
- [ ] Implement rate limiting
- [ ] Add CSRF tokens
- [ ] Set up security headers
- [ ] Enable WAF rules

## 🛠️ Project Structure

```
soussmassa-rh3/
├── pages/                      # Route pages
│   ├── Landing.tsx            # Home page
│   ├── Login.tsx              # Login form
│   ├── Register.tsx           # Registration (2-step)
│   ├── JobBoard.tsx           # Job listings
│   ├── JobDetail.tsx          # Job details + apply
│   ├── CreateJob.tsx          # Post new job
│   ├── DashboardCandidate.tsx # Candidate dashboard
│   └── DashboardCompany.tsx   # Company dashboard
├── services/                   # API & external services
│   ├── api.ts                 # REST API calls with validation
│   └── gemini.ts              # Gemini AI integration
├── App.tsx                     # Main app component
├── types.ts                    # TypeScript interfaces
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript config
├── index.html                 # HTML entry point
├── index.tsx                  # React entry point
├── tailwind.config.js         # Tailwind CSS config
│
├── deploy.sh                  # Production deployment script
├── setup-aws.sh               # AWS infrastructure setup
├── fix-and-configure.ps1      # Configuration helper (Windows)
│
├── dist/                      # Production build output
├── node_modules/              # Dependencies
│
├── .env.local                 # 🔐 Local environment (NOT in git)
├── .env.example               # Environment template
├── .gitignore                 # Git ignore rules
├── package.json               # Dependencies & scripts
│
├── README.md                  # This file
├── EXPERT_REVIEW.md          # Critical issues & solutions
└── IMPROVEMENTS.md           # Code improvements applied
```

## 🔄 Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
npm run type-check       # TypeScript type checking
npm run security-check   # npm audit for vulnerabilities
npm run test            # Run test suite
npm run lint            # Lint code (when configured)
npm run validate        # Run all checks
npm run deploy          # Deploy to AWS
npm run setup-aws       # Setup AWS infrastructure
npm run prod-deploy     # Build and deploy to production
npm run configure       # Run configuration script (Windows)
```

## 🌍 Environment Variables

Required environment variables in `.env.local`:

```env
# AWS Configuration
VITE_API_BASE_URL=https://api-id.execute-api.eu-west-3.amazonaws.com/V1
VITE_AWS_REGION=eu-west-3
VITE_AWS_S3_BUCKET=soussmassa-rh-cv-coffre
VITE_AWS_USER_POOL_ID=eu-west-3_XXXXXXXXX
VITE_AWS_USER_POOL_CLIENT_ID=XXXXXXXXX

# Gemini AI
API_KEY=YOUR_GEMINI_API_KEY

# Optional: For production
NODE_ENV=production
```

⚠️ **Never commit .env.local to git!** It's in .gitignore for a reason.

## 📊 Performance Metrics

Target metrics for production:

- **Bundle Size:** < 100KB (gzipped)
- **First Contentful Paint:** < 1.5s
- **Largest Contentful Paint:** < 2.5s
- **Cumulative Layout Shift:** < 0.1
- **Time to Interactive:** < 3.5s

## 🐛 Troubleshooting

### "Cannot find module" errors

```bash
# Clear node_modules and reinstall
rm -r node_modules package-lock.json
npm install
```

### S3 Access Denied

See **EXPERT_REVIEW.md** → Issue #1 for complete troubleshooting guide.

### API calls failing

1. Check `.env.local` has valid `VITE_API_BASE_URL`
2. Verify API Gateway endpoint is deployed
3. Check CloudWatch logs: `aws logs tail /aws/lambda/soussmassa-rh --follow`

### Memory issues during build

```bash
# Increase Node memory limit
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

## 📞 Support & Resources

- **AWS Documentation:** https://docs.aws.amazon.com/
- **React Documentation:** https://react.dev/
- **Vite Documentation:** https://vitejs.dev/
- **Tailwind CSS:** https://tailwindcss.com/
- **Security Best Practices:** https://owasp.org/

## 🤝 Contributing

1. Read EXPERT_REVIEW.md for architecture guidelines
2. Follow TypeScript strict mode
3. Add tests for new features
4. Run validation: `npm run validate`
5. Keep security in mind!

## 📄 License

ISC License - See package.json

## 🎯 Roadmap

- [ ] Complete backend Lambda functions
- [ ] Set up CI/CD pipeline (GitHub Actions)
- [ ] Add comprehensive test suite
- [ ] Implement advanced matching algorithm
- [ ] Multi-language support (FR/EN/AR)
- [ ] Mobile app (React Native)
- [ ] Admin dashboard
- [ ] Analytics & reporting

## ⚠️ Known Issues

See **EXPERT_REVIEW.md** for:
- 18 identified critical and high-priority issues
- Detailed explanations of each issue
- Complete fix code and implementation guides

## 🚀 Next Steps

1. **Immediate:**
   - [ ] Review EXPERT_REVIEW.md
   - [ ] Secure API keys and credentials
   - [ ] Run fix-and-configure script
   - [ ] Test locally with `npm run dev`

2. **Short-term (1-2 weeks):**
   - [ ] Setup AWS infrastructure
   - [ ] Deploy to production
   - [ ] Enable monitoring

3. **Medium-term (1 month):**
   - [ ] Implement tests
   - [ ] Add error boundaries
   - [ ] Set up CI/CD pipeline

4. **Long-term:**
   - [ ] Scale infrastructure
   - [ ] Add new features
   - [ ] Performance optimization

---

**Last Updated:** January 30, 2026
**Status:** ✅ Ready for Development (⚠️ Security Fixes Required for Production)
