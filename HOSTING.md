# How to put Brain Dump online (with notifications) – no IT experience needed

This guide gets your app on the web and sends **push notifications** to your iPhone when a task is due (e.g. 9:00 AM on the due date). Everything runs on **Vercel** (free) and **no coding** is required—just follow the steps.

---

## What you’ll do in short

1. Put your project on **GitHub** (free).
2. Connect it to **Vercel** (free) so the app and backend are live.
3. Add a **database** (Vercel KV / Redis, free tier) and set a few **secrets**.
4. Open the live URL on your iPhone and **Add to Home Screen**.
5. Turn on **notifications** in the app and add tasks with due dates → you’ll get a push at 9 AM on the due day.

---

## Step 1 – Get a GitHub account (if you don’t have one)

1. Go to [github.com](https://github.com) and click **Sign up**.
2. Create a free account (email, password, username).
3. You don’t need to use Git from the command line; we’ll use the website.

---

## Step 2 – Put your project on GitHub

1. On your Mac, open **Terminal** (search “Terminal” in Spotlight).
2. Go to your project folder, for example:
   ```bash
   cd ~/Desktop/brain-dump
   ```
3. Turn the folder into a Git repo and push to GitHub (copy and run these one by one):

   ```bash
   git init
   git add .
   git commit -m "Brain Dump app with backend"
   ```

4. On [github.com](https://github.com), click the **+** (top right) → **New repository**.
5. Name it e.g. **brain-dump**, leave “Add a README” **unchecked**, click **Create repository**.
6. Back in Terminal, run (replace `YOUR_USERNAME` with your GitHub username):

   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/brain-dump.git
   git branch -M main
   git push -u origin main
   ```

   When it asks for login, use your GitHub username and a **Personal Access Token** as the password (see [GitHub: Creating a token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) – create a token with “repo” scope and paste it when Terminal asks for a password).

Your code is now on GitHub.

---

## Step 3 – Create a Vercel account and import the project

1. Go to [vercel.com](https://vercel.com) and click **Sign Up**.
2. Choose **Continue with GitHub** and allow Vercel to see your repos.
3. After login, click **Add New…** → **Project**.
4. Find **brain-dump** in the list and click **Import**.
5. Leave all settings as they are and click **Deploy**.
6. Wait until the deployment finishes. You’ll get a URL like **https://brain-dump-xxxx.vercel.app**. That’s your app. Open it in a browser to confirm it loads.

---

## Step 4 – Add a database (Vercel KV / Redis)

The backend needs a small database to store notification subscriptions and scheduled reminders.

1. In your Vercel project, open the **Storage** tab.
2. Click **Create Database**.
3. Choose **KV** (or **Upstash Redis** if that’s what you see) and create it. Name it e.g. **brain-dump-kv**.
4. When asked to link it to your project, select your **brain-dump** project and confirm.

Vercel will add the required environment variables (**KV_REST_API_URL**, **KV_REST_API_TOKEN**) to your project. You don’t need to copy them manually.

---

## Step 5 – Generate VAPID keys and set environment variables

These keys let the server send push notifications securely.

1. On your Mac, in Terminal, go to the project folder and install dependencies (only needed once).  
   If you don’t have Node.js, install it from [nodejs.org](https://nodejs.org) (LTS version) first.

   ```bash
   cd ~/Desktop/brain-dump
   npm install
   ```

2. Generate the keys:

   ```bash
   npm run generate-vapid
   ```

   You’ll see two lines, for example:

   - `VAPID_PUBLIC_KEY=BEl62...`
   - `VAPID_PRIVATE_KEY=xyz123...`

3. In Vercel: open your project → **Settings** → **Environment Variables**.
4. Add these (copy the **names** exactly; paste your **values** from the Terminal output):

   | Name              | Value (paste from Terminal) |
   |-------------------|-----------------------------|
   | `VAPID_PUBLIC_KEY`  | The long string after `VAPID_PUBLIC_KEY=` |
   | `VAPID_PRIVATE_KEY` | The long string after `VAPID_PRIVATE_KEY=` |
   | `CRON_SECRET`       | Any random string you make up (e.g. `my-secret-123`) |

   For each one: paste the name, paste the value, choose **Production** (and optionally **Preview**), then **Save**.

5. **Redeploy** so the new variables are used: go to the **Deployments** tab → click the **⋯** on the latest deployment → **Redeploy**.

---

## Step 6 – Turn on the reminder job (free; runs every 15 minutes)

The app needs something to call your `/api/cron` URL every 15 minutes so due-date reminders get sent. On the **free Vercel plan**, built-in cron can only run once per day, so we use a **free external cron service** instead.

1. Go to [cron-job.org](https://cron-job.org) and create a **free account** (Sign up with email or Google).
2. After login, click **Create cronjob**.
3. Fill in:
   - **Title:** e.g. `Brain Dump reminders`
   - **Address (URL):** your Vercel app URL + `/api/cron`, e.g.  
     `https://brain-dump-xxxx.vercel.app/api/cron`  
     (Replace with your real Vercel URL.)
   - **Schedule:** choose **Every 15 minutes** (or “Every 15 min”).
   - **Request method:** **GET** (or leave default).
4. Add the secret so only this job can trigger your API:
   - Find **Request headers** or **Advanced** and add a header:
     - **Name:** `Authorization`
     - **Value:** `Bearer YOUR_CRON_SECRET`  
       (Replace `YOUR_CRON_SECRET` with the same value you set as `CRON_SECRET` in Vercel in Step 5.)
5. Save the cron job (e.g. **Create cronjob** or **Save**).

The service will call your API every 15 minutes. Reminders will be sent within about 15 minutes of 9 AM on the due date.

---

## Step 7 – Use the app on your iPhone with notifications

1. On your iPhone, open **Safari** and go to your Vercel URL (e.g. **https://brain-dump-xxxx.vercel.app**).
2. Tap the **Share** button (square with arrow) → **Add to Home Screen** → name it “Brain Dump” → **Add**.
3. Open **Brain Dump** from the home screen (full-screen app).
4. In the app, scroll to the bottom and tap **Enable notifications** → when iOS asks, tap **Allow**.
5. Add a **task** and set a **due date**, then save.  
   You’ll get a **push notification** at **9:00 AM** on that date (even if the app is closed), as long as the cron has run (at most 15 minutes after 9 AM).

---

## Troubleshooting

- **“Notifications blocked”**  
  You previously said “Don’t Allow”. On iPhone: **Settings → Safari → (or the site name) → Notifications** and turn them **On** for this site, then reload the app and enable notifications again in the app.

- **No notification at 9 AM**  
  - Make sure you tapped **Enable notifications** and allowed them.  
  - The cron runs every 15 minutes, so the push can be sent up to ~15 minutes after 9 AM.  
  - Check in Vercel **Deployments** that the latest deploy succeeded, and in **Functions** or **Logs** that `/api/cron` is being called.

- **App works but “Enable notifications” doesn’t register**  
  Make sure you’re using the app from the **home screen** (PWA), not from Safari’s address bar. Push works when the app is installed as “Add to Home Screen” (iOS 16.4+).

- **I changed code and want to update the live app**  
  In Terminal:
  ```bash
  cd ~/Desktop/brain-dump
  git add .
  git commit -m "Update app"
  git push
  ```
  Vercel will redeploy automatically.

---

## Summary

| Step | What you did |
|------|------------------|
| 1–2  | Put the project on GitHub. |
| 3    | Imported it on Vercel and got a live URL. |
| 4    | Created a KV database and linked it to the project. |
| 5    | Generated VAPID keys and set `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, and `CRON_SECRET` in Vercel. |
| 6    | Set up a free cron at cron-job.org to call `/api/cron` every 15 minutes with your `CRON_SECRET`. |
| 7    | Opened the URL on iPhone → Add to Home Screen → Enable notifications → add tasks with due dates. |

You now have Brain Dump hosted with a backend and push notifications, with no monthly cost and no server to manage.
