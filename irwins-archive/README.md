# Irwin's Archive

Your personal website. Built with Astro + Decap CMS + Netlify.

---

## DEPLOYMENT — EXACT STEPS (do these once)

### Step 1 — Create a GitHub account
Go to https://github.com → Sign up → Free plan is fine.

### Step 2 — Create a new repository
- Click the + button (top right) → New repository
- Name it: `irwins-archive`
- Set to **Public**
- Click **Create repository**

### Step 3 — Upload these files to GitHub
- On the repository page, click **uploading an existing file**
- Drag ALL the files and folders from this zip into the uploader
- Click **Commit changes**

### Step 4 — Create a Netlify account
Go to https://netlify.com → Sign up with GitHub → Free plan.

### Step 5 — Deploy the site
- In Netlify: click **Add new site** → **Import an existing project**
- Choose **GitHub** → find `irwins-archive`
- Build command: `npm run build`
- Publish directory: `dist`
- Click **Deploy site**

Your site will be live at something like `irwins-archive.netlify.app` in ~2 minutes.

### Step 6 — Enable the admin panel (Netlify Identity)
This is what lets you post from /admin without coding.

- In Netlify dashboard → your site → **Site configuration** → **Identity**
- Click **Enable Identity**
- Scroll to **Registration** → set to **Invite only**
- Scroll to **Services** → **Git Gateway** → click **Enable Git Gateway**
- Go to **Identity** tab → click **Invite users** → enter your email
- Check your email and accept the invite → set a password

That's it. Now go to `yoursite.netlify.app/admin` and log in.

---

## POSTING (every day, no coding)

Go to: `yoursite.netlify.app/admin`

Log in → You'll see three sections:
- **Writing** → New Writing Post
- **Motion Pictures** → New Motion Pictures Post
- **Projects** → New Project Post

Fill in the form → Hit **Publish** → Site rebuilds in ~1 minute.

---

## UPDATING YOUR SOCIAL LINKS

Open: `src/layouts/BaseLayout.astro`

Find this section at the bottom of the file and update the URLs:

```
<a href="https://linkedin.com/in/YOUR-USERNAME" ...>LinkedIn</a>
<a href="https://instagram.com/YOUR-USERNAME" ...>Instagram</a>
<a href="https://substack.com/@YOUR-USERNAME" ...>Substack</a>
```

Also update in: `src/pages/about.astro`

---

## CUSTOM DOMAIN (optional, do later)

Once you like the site, buy `irwinsarchive.com` from Namecheap or Google Domains (~$12/year).

In Netlify → Domain management → Add custom domain → Follow the DNS instructions.

---

## SITE STRUCTURE

```
src/
  content/
    writing/      ← your writing posts (markdown files)
    films/        ← your film reflections
    projects/     ← your projects
  pages/
    index.astro           ← home page
    writing/
    motion-pictures/
    projects/
    about.astro
  layouts/
    BaseLayout.astro      ← nav, footer, fonts, anti-copy scripts
  styles/
    global.css            ← all design/styling
public/
  admin/
    config.yml    ← CMS form fields (change these to add/remove fields)
    index.html    ← CMS admin panel loader
```

---

## DESIGN DETAILS

- **Heading font**: Cormorant Garamond (cinematic serif)
- **Body font**: Inter (clean sans-serif)
- **Metadata font**: Courier Prime (typewriter — used only for dates, categories, labels)
- **Color**: Monochrome dark (#080808 background, #e8e8e8 text)
- **Anti-copy**: Right-click disabled, drag disabled, keyboard shortcuts disabled
- **Copyright**: Footer and meta tags

---

*© Irwin's Archive™*
