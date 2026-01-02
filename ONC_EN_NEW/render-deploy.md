# Deploy to Render

## Steps:
1. Push code to GitHub
2. Connect GitHub repo to Render
3. Use the render.yaml configuration (already created)
4. Deploy automatically

## Manual Setup:
- Service Type: Web Service
- Build Command: (leave empty - Docker handles it)
- Start Command: nginx -g 'daemon off;'
- Port: 80
- Environment: Docker