# 🗄️ MongoDB Atlas Quick Start Guide

## 📝 Step-by-Step Setup

### 1. Get Your MongoDB Atlas Connection String

From your MongoDB Atlas dashboard:
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string (looks like):
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/tinylink?retryWrites=true&w=majority
   ```

### 2. Configure Locally

**Option A: Using Root .env File (Easiest)**
```bash
# Create .env in project root
cp .env.example .env

# Edit .env and paste your MongoDB Atlas URI
# MONGO_URI=mongodb+srv://your-actual-connection-string
```

**Option B: Using server/.env File**
```bash
cd server
cp .env.example .env
# Edit server/.env and paste your MongoDB Atlas URI
```

### 3. Run with MongoDB Atlas

```bash
# Stop current containers
docker-compose down

# Start with MongoDB Atlas (no local MongoDB)
docker-compose -f docker-compose.atlas.yml up
```

---

## 🚀 For Jenkins CI/CD

### Add MongoDB URI to Jenkins

1. **Go to Jenkins** → Manage Jenkins → Manage Credentials
2. **Add Credentials**:
   - Kind: `Secret text`
   - Secret: Your MongoDB Atlas connection string
   - ID: `mongodb-atlas-uri`
   - Description: `MongoDB Atlas Connection String`
3. **Save**

Your Jenkinsfile is already configured to use credentials!

---

## ✅ Verify Connection

```bash
# Check server logs
docker logs tinylink-server

# Should see:
# "MongoDB Connected: cluster0.xxxxx.mongodb.net" ✅
```

---

## 📚 Full Documentation

See [MONGODB_ATLAS.md](./MONGODB_ATLAS.md) for complete guide including:
- Security best practices
- Different environments (dev/staging/prod)
- Troubleshooting
- Jenkins integration details

---

## 🔒 Important Security Notes

✅ **DO**: Use `.env` files for your connection string
✅ **DO**: Add `.env` to `.gitignore` (already done)
✅ **DO**: Use different databases for dev/staging/prod

❌ **DON'T**: Commit your MongoDB URI to Git
❌ **DON'T**: Share your connection string publicly
❌ **DON'T**: Use the same database for all environments
