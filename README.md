# TalentBridge — Job Portal

A full-stack, production-ready job portal built with **Next.js 14**, **MongoDB**, **NextAuth**, and **Tailwind CSS**.

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Database | MongoDB + Mongoose |
| Auth | NextAuth.js (Credentials) |
| Language | TypeScript |
| UI | Custom component library |
| Notifications | react-hot-toast |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/   # NextAuth handler
│   │   ├── auth/register/        # User registration
│   │   ├── jobs/                 # CRUD for jobs
│   │   ├── jobs/[id]/apply/      # Job applications
│   │   ├── jobs/[id]/applicants/ # View applicants
│   │   ├── applications/[id]/    # Update application status
│   │   ├── users/[id]/           # User management
│   │   └── admin/                # Admin endpoints
│   ├── auth/
│   │   ├── login/                # Login page
│   │   └── register/             # Register page
│   ├── jobs/
│   │   ├── page.tsx              # Jobs listing
│   │   └── [id]/page.tsx         # Job detail
│   ├── employer/
│   │   ├── page.tsx              # Employer dashboard
│   │   ├── jobs/                 # Manage jobs
│   │   └── applicants/[jobId]/   # View applicants
│   ├── admin/
│   │   ├── page.tsx              # Admin dashboard
│   │   ├── jobs/                 # Manage all jobs
│   │   └── users/                # Manage users
│   ├── layout.tsx
│   ├── page.tsx                  # Home page
│   └── globals.css
├── components/
│   ├── layout/     # Navbar, Footer
│   ├── jobs/       # JobCard, SearchBar, ApplyButton
│   ├── employer/   # EmployerSidebar, JobForm, etc.
│   ├── admin/      # AdminSidebar, AdminJobActions, etc.
│   └── ui/         # StatsCard, Spinner
├── lib/
│   ├── auth.ts     # NextAuth config
│   ├── db.ts       # MongoDB connection
│   └── utils.ts    # Helpers, constants
├── models/
│   ├── User.ts
│   ├── Job.ts
│   └── Application.ts
└── types/
    └── next-auth.d.ts
```

---

## 🚀 Setup Instructions

### 1. Prerequisites

- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- npm or yarn

### 2. Clone & Install

```bash
git clone <your-repo>
cd jobportal
npm install
```

### 3. Configure Environment Variables

Copy the example env file and fill in your values:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
MONGODB_URI=mongodb://localhost:27017/jobportal
# or for Atlas: mongodb+srv://user:pass@cluster.mongodb.net/jobportal

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-at-least-32-characters-long
```

> **Generate a secret:** Run `openssl rand -base64 32` in your terminal

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Seed an Admin User

Create an admin directly in MongoDB, or register a normal user and update their role:

```js
// In MongoDB shell or Compass
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

Or use this one-time seed script (optional):

```bash
node -e "
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobportal').then(async () => {
  const hash = await bcrypt.hash('admin123', 12);
  await mongoose.connection.collection('users').insertOne({
    name: 'Admin User', email: 'admin@example.com', password: hash,
    role: 'admin', isActive: true, createdAt: new Date(), updatedAt: new Date()
  });
  console.log('Admin created: admin@example.com / admin123');
  process.exit(0);
});
"
```

---

## 🔐 User Roles

| Role | Capabilities |
|---|---|
| **jobseeker** | Browse jobs, apply, upload resume, view applications |
| **employer** | Post/edit/delete jobs, view applicants, manage applications |
| **admin** | Approve/reject jobs, manage all users and jobs |

---

## 📋 Feature Overview

### Job Seeker
- Register & login
- Browse and search jobs with filters (category, type, location, experience)
- View detailed job pages
- Apply with cover letter and resume URL
- Application status tracking

### Employer
- Register with company details
- Post jobs with rich details (skills, benefits, salary, requirements)
- Edit and delete own job postings
- View all applicants per job
- Update applicant status (pending → reviewing → shortlisted → hired/rejected)

### Admin
- Admin dashboard with platform-wide stats
- Review and approve/reject pending job posts
- Manage all users (activate/deactivate/delete)
- View and manage all job listings

---

## 🏗 Production Deployment

### Deploy to Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

Set these environment variables in Vercel dashboard:
- `MONGODB_URI`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (your production URL)

### Build Locally

```bash
npm run build
npm start
```

---

## 🧪 Test Accounts (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | admin@example.com | admin123 |
| Employer | Register at /auth/register?role=employer | — |
| Job Seeker | Register at /auth/register | — |

---

## 🔧 Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `NEXTAUTH_URL` | ✅ | Full URL of your app |
| `NEXTAUTH_SECRET` | ✅ | 32+ char random secret |

---

## 📦 Key Dependencies

```json
{
  "next": "14.2.5",
  "next-auth": "^4.24.7",
  "mongoose": "^8.4.4",
  "bcryptjs": "^2.4.3",
  "tailwindcss": "^3.4.1",
  "react-hot-toast": "^2.4.1",
  "lucide-react": "^0.408.0",
  "date-fns": "^3.6.0"
}
```

---

## 🎨 Design System

- **Font**: Syne (display) + DM Sans (body) + JetBrains Mono (code)
- **Primary Color**: Indigo/ink palette (`#5061ff`)
- **Components**: Custom `card`, `btn-primary`, `btn-secondary`, `badge`, `input-field` utility classes
- **Animations**: CSS fade-in, slide-up transitions

---

Built with ❤️ using Next.js 14 App Router
