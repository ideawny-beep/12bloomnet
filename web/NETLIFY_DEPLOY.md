# 🚀 Deploy BloomNet to Netlify

## Quick Start (3 Steps)

### Step 1: Create a Netlify Account
1. Go to [netlify.com](https://www.netlify.com)
2. Sign up with GitHub, GitLab, Google, or email

### Step 2: Connect Your Repository
1. Push this project to GitHub (or GitLab):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - BloomNet"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/bloomnet.git
   git push -u origin main
   ```

2. On Netlify dashboard, click **"New site from Git"**
3. Select your repository
4. Click **Deploy**

### Step 3: Your App is Live! 🎉
Netlify will automatically:
- Build your site
- Deploy to a live URL
- Show you the deployment status

---

## Manual Deploy (Drag & Drop)

If you don't want to use Git:

1. Go to [netlify.com/drop](https://app.netlify.com/drop)
2. Drag and drop the `public/` folder
3. Your site goes live instantly!

---

## Deployment Settings

**Build Command:** `echo 'Build complete'`  
**Publish Directory:** `public`

These are already configured in `netlify.toml`

---

## Features on Netlify

✅ **Live Interactive Map** - Works great on Netlify  
✅ **Demo Data Loading** - Auto-loads sample cases  
✅ **Forms & Navigation** - All pages accessible  
✅ **Local Storage** - Data saves in browser  

---

## Important Notes

⚠️ **Backend API Not Available on Netlify**
- Netlify only hosts static files (no Node.js server)
- The `server.js` file is for local development only
- Your app works with **browser's local storage** instead
- Demo data loads automatically on app.html

---

## Your Live URL

After deployment, Netlify gives you a free URL like:
```
https://bloomnet-yourname.netlify.app
```

You can also add a **custom domain** in Netlify settings.

---

## Environment Setup

All files are ready to deploy as-is. No configuration needed!

✅ netlify.toml configured  
✅ public/ folder ready  
✅ HTML files optimized  
✅ JavaScript fully functional  

---

## Troubleshooting

**Site won't load?**
- Clear browser cache (Ctrl+Shift+Del)
- Check netlify.toml is in root folder
- Make sure public/ folder exists

**Demo data not loading?**
- Check browser console (F12 → Console tab)
- Click "Load Demo Data" button manually on app.html

**Need help?**
- Netlify docs: https://docs.netlify.com
- Contact: support@netlify.com

---

Happy deploying! 🌱
