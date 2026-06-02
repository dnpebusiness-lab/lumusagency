# Gmail API Setup — One-Time Instructions

This is a one-time process. Once done, the daily workflow creates Gmail drafts automatically.

---

## Step 1 — Google Cloud project

1. Go to https://console.cloud.google.com/
2. Create a new project (or use an existing one) — name it "Lumus Agency"
3. In the left menu go to **APIs & Services → Library**
4. Search for **Gmail API** and click **Enable**

---

## Step 2 — OAuth credentials

1. Go to **APIs & Services → Credentials**
2. Click **Create Credentials → OAuth client ID**
3. Application type: **Desktop app**
4. Name: "Lumus Gmail Bot"
5. Click **Create**
6. Download the JSON file — it contains `client_id` and `client_secret`

---

## Step 3 — OAuth consent screen

1. Go to **APIs & Services → OAuth consent screen**
2. User type: **External**
3. Fill in app name ("Lumus"), support email (your Gmail)
4. Under **Scopes** add both:
   - `https://www.googleapis.com/auth/gmail.compose`
   - `https://www.googleapis.com/auth/gmail.send`
5. Under **Test users** add your Gmail address: `dnpebusiness@gmail.com`
6. Save

---

## Step 4 — Get the refresh token (run once locally)

Install dependencies locally:

```bash
pip install google-auth-oauthlib
```

Create a file called `get_token.py` (do NOT commit this):

```python
from google_auth_oauthlib.flow import InstalledAppFlow

flow = InstalledAppFlow.from_client_secrets_file(
    "credentials.json",   # the file you downloaded in Step 2
    scopes=[
        "https://www.googleapis.com/auth/gmail.compose",
        "https://www.googleapis.com/auth/gmail.send",
    ]
)
creds = flow.run_local_server(port=0)
print("CLIENT_ID:", creds.client_id)
print("CLIENT_SECRET:", creds.client_secret)
print("REFRESH_TOKEN:", creds.refresh_token)
```

Run it:
```bash
python3 get_token.py
```

A browser window will open — sign in with `dnpebusiness@gmail.com` and allow access.
Copy the three values it prints.

---

## Step 5 — Add secrets to GitHub

Go to your GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**

Add these four secrets:

| Secret name             | Value                              |
|-------------------------|------------------------------------|
| `GOOGLE_PLACES_API_KEY` | Your Google Places API key         |
| `GMAIL_CLIENT_ID`       | From Step 4 output                 |
| `GMAIL_CLIENT_SECRET`   | From Step 4 output                 |
| `GMAIL_REFRESH_TOKEN`   | From Step 4 output                 |

Optional (for Claude-powered personalised copy):

| Secret name        | Value                    |
|--------------------|--------------------------|
| `ANTHROPIC_API_KEY`| Your Anthropic API key   |

---

## Step 6 — Done

The workflow `.github/workflows/daily_drafts.yml` runs automatically Monday–Friday at 08:00 Irish time.

Each morning you'll find new Gmail drafts ready to review and send.
To trigger it manually: GitHub → Actions → "Lumus Daily Gmail Drafts" → Run workflow.
