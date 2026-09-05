# Going live: staged deployment to app.bxbii.com

The staged rollout: prove the platform out on a subdomain first, migrate the real Miran Studio training content, then point bxbii.com itself at it.

Stack: Railway (Postgres + NestJS API) + Vercel (Next.js web app).

## Part A - Push to GitHub

Done - this repo already has the code under edusec-cloud/.

## Part B - Database + API on Railway

1. Sign up/log in at railway.app, New Project -> Provision PostgreSQL.
2. 2. In the same project, New -> GitHub Repo, pick this repo.
   3. 3. On the service Settings tab: Root Directory = edusec-cloud, Dockerfile Path = apps/api/Dockerfile.
      4. 4. Variables tab, add: DATABASE_URL (Add Reference to the Postgres service), JWT_ACCESS_SECRET (first secret from chat), JWT_ACCESS_TTL=15m, JWT_REFRESH_SECRET (second secret from chat), JWT_REFRESH_TTL=7d, DEFAULT_TENANT_ID=00000000-0000-0000-0000-000000000001, STORAGE_DRIVER=local.
         5. 5. Deploy. Copy the public Railway URL for Part D.
           
            6. ## Part C - Migrate and seed the database
           
            7. From your own machine (Node 20+, deps installed):
           
            8.     DATABASE_URL="<Railway Postgres URL>" pnpm --filter @bxbii/db exec prisma migrate deploy
            9.     DATABASE_URL="<same>" pnpm --filter @bxbii/db exec prisma db seed
           
            10. Creates the tenant, branches, roles, super admin (admin@bxbii.local / ChangeMe123!), and the bxbii home page + navigation. Sign in and change that password immediately.
           
            11. ## Part D - Web app on Vercel
           
            12. 1. Sign up/log in at vercel.com, Add New -> Project, import this repo.
                2. 2. Root Directory = edusec-cloud/apps/web.
                   3. 3. Environment Variables: NEXT_PUBLIC_API_URL = the Railway API URL from Part B.
                      4. 4. Deploy, confirm the *.vercel.app URL works before adding the custom domain.
                        
                         5. ## Part E - Point app.bxbii.com at it
                        
                         6. 1. Vercel project -> Settings -> Domains -> add app.bxbii.com. Vercel shows the exact DNS record needed (usually CNAME app -> cname.vercel-dns.com).
                            2. 2. Add that record at GoDaddy (DNS management for bxbii.com). This does not touch the root domain or the current Miran Studio page.
                               3. 3. Vercel auto-provisions TLS once DNS resolves.
                                 
                                  4. ## Part F - Verify, then lock it down
                                 
                                  5. - Visit https://app.bxbii.com - the bxbii home page, language toggle, seeded navigation should show.
                                     - - Go to /login, sign in with admin@bxbii.local / ChangeMe123!, change that password immediately.
                                       - - Click through admin Pages and Navigation screens, confirm edits save and show on the public site.
                                        
                                         - ## Part G - Later: cut bxbii.com itself over
                                        
                                         - Once Training carries real Miran Studio content and app.bxbii.com is solid: repeat Part E for bxbii.com and www.bxbii.com instead of the app subdomain.
                                        
                                         - ## What's still open
                                        
                                         - - CORS is wide open (cors: true in apps/api/src/main.ts) - narrow it to app.bxbii.com/bxbii.com before real traffic.
                                           - - No self-service password reset yet for the seeded super admin.
                                             - - STORAGE_DRIVER=local doesn't persist across Railway redeploys - switch to S3/R2 once uploads matter.
                                               - 
