# 🚀 NextHire – AI-Powered Job Search & Resume Optimizer

**NextHire** is an intelligent job search and resume optimization platform built using modern full-stack technologies and Large Language Models (LLMs). It helps job seekers increase their chances of landing interviews by analyzing, parsing, and optimizing resumes for Applicant Tracking Systems (ATS).

---

## 🔍 Features

- ✅ **AI Resume Parser** – Extracts skills, experience, education, and other key insights using LLMs and the Gemini API.
- 🎯 **ATS Optimization** – Evaluates resumes and offers suggestions to improve compatibility with job postings.
- 🤖 **Real-Time Job Matching** – Matches user profiles with relevant job listings based on skill alignment.
- 🔐 **Secure Data Storage** – Uses MongoDB for storing user data, resumes, and analytics securely.
- 🌐 **Modern UI** – Built with React.js + Redux for smooth navigation and interaction.

---

## 🛠️ Tech Stack

| Layer         | Technologies |
|---------------|--------------|
| **Frontend**  | React.js, Redux, Tailwind CSS |
| **Backend**   | Node.js, Express.js |
| **Database**  | MongoDB |
| **AI/ML**     | Gemini API, LLM-based Resume Parser |
| **Others**    | Git, GitHub, Postman |

---

## 🚦 Getting Started

### Prerequisites

- Node.js
- MongoDB (local or Atlas)
- Gemini API Key or any LLM integration credentials

### Installation

```bash
git clone https://github.com/stuti2804/nexthire.git
cd nexthire

# For frontend
cd client
npm install

# For backend
cd ../server
npm install

PORT=5000
MONGO_URI=your_mongodb_uri
GEMINI_API_KEY=your_api_key



