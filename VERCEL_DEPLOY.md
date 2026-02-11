# Vercel Deployment Guide

## Prerequisites

1. Vercel account (sign up at https://vercel.com)
2. Backend API deployed and accessible
3. Git repository (GitHub, GitLab, or Bitbucket)

## Deployment Steps

### 1. Environment Variables

Before deploying, you need to set up environment variables in Vercel:

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add the following variable:
   - `NEXT_PUBLIC_API_URL` - Your backend API URL (e.g., `https://api.yourdomain.com`)

### 2. Deploy via Vercel Dashboard

1. Import your Git repository in Vercel
2. Vercel will auto-detect Next.js
3. Configure environment variables (see step 1)
4. Click "Deploy"

### 3. Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### 4. Post-Deployment

After deployment, make sure to:

1. Update CORS settings on your backend to allow requests from your Vercel domain
2. Test authentication flow
3. Verify API endpoints are accessible
4. Check that environment variables are set correctly

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `https://api.yourdomain.com` |

## Troubleshooting

### Build Errors

- Ensure all dependencies are listed in `package.json`
- Check that TypeScript types are correct
- Verify environment variables are set

### API Connection Issues

- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check CORS settings on backend
- Ensure backend is accessible from Vercel's servers

### Authentication Issues

- Verify Sanctum token handling works with your backend domain
- Check cookie settings (SameSite, Secure flags)
- Ensure backend accepts requests from Vercel domain
