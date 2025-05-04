# NestJS Auth API

This project is a production-ready backend built with NestJS.  
It includes user authentication, access and refresh tokens, session handling, and auto-generated Swagger API documentation.

---

## 🚀 Features

- User registration and login
- Access & refresh JWT tokens
- Session validation using cache manager
- Logout functionality
- Protected routes with custom `AuthGuard`
- Swagger API documentation

---

## 🛠️ Tech Stack

- **NestJS** with modular architecture
- **MongoDB** (via Mongoose)
- **JWT** for authentication
- **Cache Manager** for session storage
- **Swagger** for API documentation

---

## 📦 Installation

```bash
npm install
```

---

## ⚙️ Environment Variables

- Create a .env file or use the provided .env.example.

**Start MongoDB**

```sh
mongod
```

or 🐳 using Docker:

```sh
docker run -d --name mongodb -p 27017:27017 mongo
```

---

## 🧪 Running the App

Start the development server:

```sh
npm run start:dev
```

### 🔍 API Base URL

- **API Base URL:** `http://localhost:3000/api/v1`

### 📘 API Documentation

- **Swagger UI:** `http://localhost:3000`
