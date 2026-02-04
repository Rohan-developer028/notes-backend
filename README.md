

# Node.js Notes Application

This is the backend API built using Node.js, Express, and MongoDB. It provides endpoints that the React Notes uses.

---

## Step 1: Install Required Software

Make sure the following are installed on your system:

* Node.js (version 14 or higher)
* npm or yarn
* Git
* MongoDB (local or cloud, e.g., MongoDB Atlas)

---

## Step 2: Get the Project from GitHub

1. Clone the repository: git clone <your-backend-repo-url>
2. Go into the project folder: cd <backend-project-folder>

---

## Step 3: Install Project Dependencies

Install all required packages:

* Using npm: npm install
* Using yarn: yarn install

---

## Step 4: Create Environment File

1. In the root folder, create a `.env` file: touch .env
2. Open the `.env` file and add the following environment variables:

PORT=5000
MONGO_URL=YOUR_MONGODB_CONNECTION_STRING

**Example:**

PORT=5000
MONGO_URL=mongodb+srv://username:password@cluster0.mongodb.net/notesapp

**Important Notes:**

* Do not commit the `.env` file to GitHub
* Restart the server after changing the `.env` file

---

## Step 5: Start the Server

* Using nodemon :nodemon
* Using node :node index.js


The server will run at: [http://localhost:5000](http://localhost:5000)

---

## Step 6: API Base URL

The backend endpoints are available under: [http://localhost:5000/api/v1](http://localhost:5000/api/v1)

Example endpoint: POST /api/v1/signup

---

## Notes

* Make sure MongoDB is running before starting the server
* Use MongoDB Atlas for production environments
* Update the frontend `REACT_APP_API_URL` to point to this backend URL

---
\
