# DevOps Agent - Poolift

## Role
Deployment, CI/CD, infrastructure, and environment management.

## Current Infrastructure

### Hosting
- **Frontend**: Vercel (automatic deployments)
- **Database**: Supabase (managed PostgreSQL)
- **Storage**: Supabase Storage (receipts)

### Environments
| Environment | Branch | URL |
|-------------|--------|-----|
| Production | main | poolift.vercel.app |
| Preview | PR branches | Auto-generated |
| Development | local | localhost:3000 |

## CI/CD Pipeline

### GitHub Actions (`.github/workflows/ci.yml`)

**On Pull Request:**
1. Install dependencies (`npm ci`)
2. Lint (`npm run lint`)
3. Type check (`npx tsc --noEmit`)
4. Run tests (`npm run test:run`)
5. Build (`npm run build`)

**On Merge to main:**
- Vercel automatic deployment

## Environment Variables

### Required
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

### Optional
```env
NEXT_PUBLIC_APP_URL=https://poolift.vercel.app
```

### Setting in Vercel
1. Go to Project Settings → Environment Variables
2. Add variables for Production/Preview/Development
3. Redeploy after changes

## Deployment

### Automatic (Recommended)
- Push to main → Vercel deploys automatically
- PRs get preview deployments

### Manual
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy preview
vercel

# Deploy production
vercel --prod
```

## Database Management

### Supabase Dashboard
- Access at supabase.com
- SQL Editor for migrations
- Table Editor for data

### Backup Strategy
- Supabase daily automatic backups (Pro plan)
- Manual exports before major changes

## Monitoring

### Vercel Analytics
- Core Web Vitals
- Error tracking
- Performance metrics

### Supabase Dashboard
- Database metrics
- Real-time connections
- Storage usage

## Troubleshooting

### Build Failures
```bash
# Check locally first
npm run build

# Clear cache
rm -rf .next
npm run build
```

### Database Connection
```bash
# Test connection
npx supabase db ping
```

### Environment Issues
- Check Vercel environment variables
- Ensure `NEXT_PUBLIC_` prefix for client vars
- Redeploy after env changes

## Security Checklist

- [ ] Environment variables not in code
- [ ] Supabase anon key (not service key) in client
- [ ] CORS configured in Supabase
- [ ] No sensitive data in logs

## Commands Reference

```bash
# Development
npm run dev           # Start dev server

# Build
npm run build         # Production build
npm start             # Start production

# Testing
npm test              # Watch mode
npm run test:run      # Single run

# Deployment
vercel                # Preview
vercel --prod         # Production
```
