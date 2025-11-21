# Deployment Guide for TinyLink

This guide will help you deploy your full-stack application. We will deploy the **Server** to **Render** and the **Client** to **Vercel**.

## Prerequisites

-   A GitHub account (you already have this and the code is pushed).
-   A [Render](https://render.com/) account.
-   A [Vercel](https://vercel.com/) account.
-   Your MongoDB connection string (MONGO_URI).

---

## Part 1: Deploying the Server (Render)

1.  **Log in to Render** and go to your Dashboard.
2.  Click **New +** and select **Web Service**.
3.  Connect your GitHub account and select the `urlShortnerApp` repository.
4.  Configure the service:
    -   **Name**: `tinylink-server` (or similar)
    -   **Root Directory**: `server` (Important!)
    -   **Environment**: `Node`
    -   **Build Command**: `npm install`
    -   **Start Command**: `npm start`
5.  Scroll down to **Environment Variables** and add:
    -   **Key**: `MONGO_URI`
    -   **Value**: `your_mongodb_connection_string_here`
    -   **Key**: `PORT`
    -   **Value**: `5000` (Optional, Render sets this automatically, but good to have)
6.  Click **Create Web Service**.
7.  Wait for the deployment to finish. Once done, copy the **Service URL** (e.g., `https://tinylink-server.onrender.com`). You will need this for the client.

---

## Part 2: Deploying the Client (Vercel)

1.  **Log in to Vercel** and go to your Dashboard.
2.  Click **Add New...** -> **Project**.
3.  Import the `urlShortnerApp` repository.
4.  Configure the project:
    -   **Framework Preset**: Next.js
    -   **Root Directory**: Click `Edit` and select `client`.
5.  Open **Environment Variables** and add:
    -   **Key**: `NEXT_PUBLIC_API_URL`
    -   **Value**: The URL you copied from Render (e.g., `https://tinylink-server.onrender.com`). **Do not add a trailing slash.**
6.  Click **Deploy**.

---

## Part 3: Final Verification

1.  Open your new Vercel deployment URL.
2.  Try to shorten a link.
3.  If it works, you're done!
