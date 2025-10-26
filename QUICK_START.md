# 🚀 Quick Start Guide

Get your expense tracker running in **5 minutes**!

---

## 📋 What You Need

- ✅ Node.js installed ([Download](https://nodejs.org/))
- ✅ Your Firebase credentials (from previous setup)
- ✅ 5 minutes

---

## ⚡ Super Quick Start

```bash
# 1. Go to project folder
cd expense-tracker-web

# 2. Install dependencies (2 min)
npm install

# 3. Create config file
cp .env.example .env

# 4. Edit .env with your Firebase details
# (Use nano, vim, or any text editor)
nano .env

# 5. Start the app
npm run dev

# 6. Open in browser
# http://localhost:5173
```

**That's it!** 🎉

---

## 📝 Fill in Your .env File

Replace these values with your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=your-actual-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=expense-tracker-13fcf.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://expense-tracker-13fcf-default-rtdb.asia-southeast1.firebasedatabase.app
VITE_FIREBASE_PROJECT_ID=expense-tracker-13fcf
VITE_FIREBASE_STORAGE_BUCKET=expense-tracker-13fcf.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

VITE_USER1_NAME=Ashwin
VITE_USER2_NAME=Pooja
```

**Where to get these?**
- Firebase Console → Project Settings → General → Your apps → Web app
- Copy the `firebaseConfig` values

---

## 🎯 First Steps After Starting

### 1. Add Your First Expense

- Click the **blue "+" button** (bottom right)
- Select **Ashwin**
- Choose **🍕 Food**
- Enter **245**
- Click **"Add Expense"**

### 2. See Your Analytics

- Check the summary cards (total, per user)
- See the category pie chart
- View the transaction list

### 3. Try Editing

- Click the **blue edit icon** on your expense
- Change the amount
- Click **"Save Changes"**

### 4. Try Deleting

- Click the **red trash icon**
- Confirm deletion

### 5. Test on Phone

- Find your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
- Open `http://YOUR_IP:5173` on phone
- Should work if on same WiFi!

---

## 📱 Access on Phone (Same WiFi)

### Find Your IP Address

**Windows**:
```bash
ipconfig
# Look for "IPv4 Address"
# Example: 192.168.1.5
```

**Mac/Linux**:
```bash
ifconfig | grep "inet "
# or
hostname -I
# Example: 192.168.1.5
```

### Open on Phone

1. Make sure phone is on **same WiFi** as computer
2. Open browser on phone
3. Go to `http://YOUR_IP:5173`
   - Example: `http://192.168.1.5:5173`
4. App should load!

---

## 🐛 Common Issues

### "Cannot find module"

**Solution**:
```bash
rm -rf node_modules
npm install
```

### "Port 5173 already in use"

**Solution**:
```bash
# Kill the process
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 3000
```

### "Firebase: Error (auth/invalid-api-key)"

**Solution**:
- Check your `.env` file
- Ensure `VITE_FIREBASE_API_KEY` is correct
- Verify no extra spaces
- Restart the dev server

### App loads but shows "No expenses"

**Solution**:
- Check Firebase Database Rules allow read/write
- Verify Database URL in `.env`
- Check browser console (F12) for errors

### Can't access from phone

**Solution**:
- Ensure phone and computer on same WiFi
- Check firewall isn't blocking port 5173
- Try `npm run dev -- --host`

---

## 🎨 Testing the App

### Add Test Data

```javascript
// Add a few expenses to test:
1. Food - 245 (Ashwin)
2. Shopping - 1500 (Pooja)
3. Groceries - 850 (Ashwin)
4. Rent - 15000 (Pooja)
5. Travel - 500 (Ashwin)
```

### Check Features

- [ ] Add expense
- [ ] Edit expense
- [ ] Delete expense
- [ ] Filter by user
- [ ] Filter by category
- [ ] Filter by date
- [ ] Export CSV
- [ ] View charts
- [ ] Mobile responsive

---

## 🚀 Next Steps

### 1. Run Locally (Now)
✅ You're here! App running on localhost.

### 2. Deploy Online (10 min)
📖 See `DEPLOYMENT.md` for instructions
→ Get a public URL both can access

### 3. Add to Home Screen
📱 Once deployed, add to phone home screens
→ Works like a native app!

### 4. Customize (Optional)
- Add more categories
- Change colors
- Modify user names
- Add features

---

## 💡 Daily Usage

### On Your Phone (After Deployment)

1. **Open the app** (from home screen icon)
2. **Tap the "+" button**
3. **Quick entry**: Select who → category → amount → done!
4. **Takes 10 seconds** per expense

### Best Practices

- **Add expenses immediately** after spending
- **Add notes** for important purchases
- **Review weekly** to see spending patterns
- **Export monthly** for records
- **Both should add** their own expenses

---

## 📞 Need Help?

**Still stuck?**

1. Check README.md for full documentation
2. Check DEPLOYMENT.md for deployment help
3. Open browser console (F12) to see errors
4. Ask me with specific error messages!

---

## ✅ Checklist

After quick start:

- [ ] Node.js installed
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created and filled
- [ ] App running (`npm run dev`)
- [ ] Opened in browser (localhost:5173)
- [ ] Added test expense
- [ ] Edited an expense
- [ ] Deleted an expense
- [ ] Tested on phone (optional)
- [ ] Ready to deploy!

---

**You're all set!** 🎉

Next: Check out `DEPLOYMENT.md` to get it online! 🚀
