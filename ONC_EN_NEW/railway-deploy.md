# Deploy to Railway

## Steps:
1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login and deploy:
   ```bash
   railway login
   railway link
   railway up
   ```

3. Your app will be live at: `https://your-app.railway.app`

## Environment Variables (if needed):
- Set in Railway dashboard
- NODE_ENV=production (already configured)