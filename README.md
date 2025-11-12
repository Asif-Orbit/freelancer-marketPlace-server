# ⚙️ Freelance MarketPlace - Server

This is the **backend server** for the **Freelance MarketPlace** web application — a full-stack platform that connects clients and freelancers through job postings.

Built with **Node.js**, **Express**, and **MongoDB**, this API handles:
- Job management (add, update, delete, fetch)
- Accepted tasks tracking
- Server-side date/time stamping
- Secure environment configuration with dotenv
- CORS-enabled endpoints for frontend (Netlify / Cloudflare / Vercel)

---

## 🧠 Overview

| Key Info | Description |
|-----------|-------------|
| Framework | **Express.js** |
| Database | **MongoDB Atlas** |
| API Type | RESTful |
| Hosting | Render / Railway / Cloudflare / Vercel |
| Auth Ready | JWT / Firebase integration possible |
| CORS | Configured for Netlify / Localhost |

---

## 🏗️ Features

### 🔹 Job Management
- **POST /allJobs** → Add new job  
- **GET /allJobs** → Fetch all jobs (sorted by latest)  
- **GET /allJobs/:id** → Get single job details  
- **DELETE /allJobs/:id** → Delete job (owner only)  
- **GET /myAddedJobs?email=user@example.com** → Fetch jobs by logged-in user  

### 🔹 Accepted Tasks
- **POST /acceptedTasks** → Accept a job (non-owner)  
- **GET /acceptedTasks?email=user@example.com** → Fetch accepted tasks  
- **DELETE /acceptedTasks/:id** → Remove (done/cancel)  

### 🔹 Smart Validations
- Prevent accepting self-posted jobs  
- Automatically sets `postedAt: new Date()` on job creation  
- Filters invalid ObjectIds and malformed payloads  
- Returns clean JSON responses with HTTP status codes  

---

