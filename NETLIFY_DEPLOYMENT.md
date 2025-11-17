# Deploy BloomNet to Netlify

## Prerequisites
1. **MongoDB Atlas Account** (Free tier available)
   - Sign up at https://www.mongodb.com/cloud/atlas
   - Create a free cluster
   - Get your connection string

2. **Netlify Account**
   - Sign up at https://www.netlify.com
   - Can deploy from GitHub or drag & drop

## Step 1: Set Up MongoDB Atlas

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account and cluster
3. Click "Connect" on your cluster
4. Choose "Connect your application"
5. Copy the connection string (looks like: `mongodb+srv://username:<password>@cluster.mongodb.net/`)
6. Replace `<password>` with your actual password
7. Add `/bloomnet` at the end: `mongodb+srv://username:password@cluster.mongodb.net/bloomnet`

## Step 2: Prepare Your Code

Your code is already restructured for Netlify! The structure is:
```
├── netlify.toml (configuration)
├── netlify/functions/ (serverless functions)
│   ├── donations.js
│   ├── requests.js
│   ├── stats.js
│   ├── messages.js
│   ├── pickups.js
│   ├── matches.js
│   ├── cross-matches.js
│   └── utils/db.js (database connection)
└── public/ (frontend files)
```

## Step 3: Deploy to Netlify

### Option A: Deploy from GitHub (Recommended)

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Restructure for Netlify deployment"
   git push origin main
   ```

2. Go to Netlify dashboard
3. Click "Add new site" → "Import an existing project"
4. Choose GitHub and select your repository
5. Build settings should auto-detect from `netlify.toml`
6. Click "Deploy site"

### Option B: Manual Deploy (Drag & Drop)

1. Create a production build folder with:
   - `netlify.toml`
   - `netlify/` folder
   - `public/` folder

2. Drag the folder to Netlify's deploy area

## Step 4: Configure Environment Variables

1. In Netlify dashboard, go to "Site settings" → "Environment variables"
2. Add this variable:
   - **Key**: `MONGODB_URI`
   - **Value**: Your MongoDB connection string from Step 1
   
3. Save and redeploy your site

## Step 5: Set Up Custom Domain

1. Go to "Domain settings" in Netlify
2. Click "Add custom domain"
3. Enter: `blooomnett.com` (or your domain)
4. Follow Netlify's DNS configuration instructions
5. Netlify will automatically set up HTTPS

## Testing Your Deployment

After deployment, test these URLs:
- Homepage: `https://your-site.netlify.app/`
- App page: `https://your-site.netlify.app/app`
- API test: `https://your-site.netlify.app/api/donations`

## Important Notes

1. **MongoDB Connection**: Make sure your MongoDB cluster allows connections from anywhere (0.0.0.0/0) in Network Access settings, or add Netlify's IP addresses.

2. **Environment Variables**: The `MONGODB_URI` environment variable is required. Without it, the functions will fail.

3. **First Deploy**: The first deploy might take 2-3 minutes as Netlify installs dependencies.

4. **Free Tier Limits**:
   - Netlify: 300 build minutes/month, 100GB bandwidth
   - MongoDB Atlas: 512MB storage, shared CPU

## Troubleshooting

### Functions failing?
- Check Netlify function logs in dashboard
- Verify MONGODB_URI is set correctly
- Ensure MongoDB cluster is accessible

### API not working?
- Check browser console for errors
- Verify `/api/*` redirect is working in `netlify.toml`
- Test functions directly: `https://your-site.netlify.app/.netlify/functions/donations`

### Need help?
- Netlify docs: https://docs.netlify.com
- MongoDB Atlas docs: https://docs.atlas.mongodb.com
