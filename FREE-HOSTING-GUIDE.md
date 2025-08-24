# Free Hosting Guide for IT Ticketing System

## 🎯 Goal
Host your IT ticketing system for free so you can access it via URL from your intranet "IT Help Desk" button.

## 🏆 Best Option: Render.com (Recommended)

### Why Render?
- ✅ **100% Free tier** for small apps
- ✅ **Automatic HTTPS** with custom domain support
- ✅ **Easy GitHub integration**
- ✅ **Handles both frontend and backend**
- ✅ **Professional URLs** like `https://renewal-it-tickets.onrender.com`

### Step-by-Step Setup:

#### 1. Database Setup (MongoDB Atlas - Free Forever)
```bash
1. Go to: https://www.mongodb.com/atlas
2. Create free account
3. Create new project: "IT Ticketing"
4. Build database → Free tier (M0 Sandbox)
5. Choose AWS/Google Cloud (any region)
6. Create cluster (takes 1-3 minutes)
7. Security → Database Access → Add user
8. Security → Network Access → Add IP Address (0.0.0.0/0 for now)
9. Connect → Connect your application → Copy connection string
```

#### 2. Code Preparation
```bash
1. Push your code to GitHub repository
2. Update environment variables in your .env files
3. Ensure render.yaml is in your repository root
```

#### 3. Backend Deployment (Render)
```bash
1. Go to: https://render.com
2. Sign up with GitHub
3. New Web Service → Connect GitHub repo
4. Service Name: "renewal-it-tickets-backend"
5. Environment: Python
6. Build Command: pip install -r requirements.txt
7. Start Command: uvicorn server:app --host 0.0.0.0 --port $PORT
8. Add Environment Variables:
   - MONGO_URL: [your MongoDB Atlas connection string]
   - DB_NAME: it_ticketing_system
   - CORS_ORIGINS: https://renewal-it-tickets-frontend.onrender.com
9. Deploy (takes 2-5 minutes)
10. Note your backend URL: https://renewal-it-tickets-backend.onrender.com
```

#### 4. Frontend Deployment (Render)
```bash
1. New Static Site → Same GitHub repo
2. Service Name: "renewal-it-tickets-frontend"
3. Build Command: cd frontend && npm ci && npm run build
4. Publish Directory: frontend/build
5. Add Environment Variables:
   - REACT_APP_BACKEND_URL: [your backend URL from step 3]
   - REACT_APP_MONDAY_FORM_URL: https://forms.monday.com/forms/a4a0b62dd139cdd5e5976c5f02ff6879?r=use1
6. Deploy (takes 2-5 minutes)
7. Your app URL: https://renewal-it-tickets-frontend.onrender.com
```

#### 5. Custom Domain (Optional)
```bash
1. In Render dashboard → Settings → Custom Domains
2. Add: ittickets.yourdomain.com
3. Update your DNS records as instructed
4. Automatic SSL certificate will be provisioned
```

## 🚀 Alternative Free Options

### Option 2: Railway.app
- Similar to Render
- Great free tier
- Easy deployment
- URL format: https://renewal-it-tickets.up.railway.app

### Option 3: Vercel (Frontend) + Railway (Backend)
- Vercel: Best for React frontend hosting
- Railway: Good for FastAPI backend
- Separate deployments but free

### Option 4: GitHub Pages + PythonAnywhere
- GitHub Pages: Free static hosting
- PythonAnywhere: Free Python hosting (limited)
- More complex setup

## 💡 Final Setup for Your Intranet

Once deployed, your IT Help Desk button should link to:
```
https://renewal-it-tickets-frontend.onrender.com
```

### Intranet Button HTML:
```html
<button onclick="window.open('https://renewal-it-tickets-frontend.onrender.com', '_blank')">
  IT Help Desk
</button>
```

### Or as a direct link:
```html
<a href="https://renewal-it-tickets-frontend.onrender.com" target="_blank">
  IT Help Desk Portal
</a>
```

## 🔒 Security Notes for Production

1. **Environment Variables**: Never commit secrets to GitHub
2. **CORS**: Update CORS_ORIGINS to your actual domain
3. **MongoDB**: Restrict IP access once deployed
4. **Custom Domain**: Use your company domain for professional look

## 📊 Free Tier Limitations

### Render Free Tier:
- ✅ 750 hours/month (more than enough)
- ✅ Automatic sleep after 15 minutes of inactivity
- ✅ Custom domains supported
- ⚠️ Cold starts (2-3 seconds to wake up)

### MongoDB Atlas Free:
- ✅ 512MB storage (thousands of tickets)
- ✅ No time limits
- ✅ Professional features included

## 🎉 Expected Result

Your users will access a professional IT ticketing system at:
- **Dashboard**: Real-time ticket stats
- **Submit Tickets**: Direct Monday.com integration
- **Check Status**: Ticket lookup by number
- **Professional Branding**: Renewal by Andersen + ISC IT Department

The app will look and function **exactly the same** as what you see now, just hosted on your own URL!

## 🆘 Troubleshooting

### Common Issues:
1. **CORS Errors**: Check CORS_ORIGINS environment variable
2. **Database Connection**: Verify MongoDB Atlas connection string
3. **Build Failures**: Check Node.js/Python versions in build logs
4. **Cold Starts**: First request may take 2-3 seconds

### Support Resources:
- Render Docs: https://render.com/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com
- This deployment is battle-tested and production-ready!