# Text Summarization NLP — Render + Cloudflare deployment

This project is a Flask application. Render runs the Python backend; a small Cloudflare Worker optionally provides a free `workers.dev` URL in front of it.

## 1. Push the project to GitHub

1. Extract this folder and open `Text-Summarization-NLP-main`.
2. Create a new GitHub repository, for example `text-summarization-nlp`.
3. Upload/push the contents of this folder to the repository root. `app.py`, `requirements.txt`, `render.yaml`, and `templates/` must be at the root.

Using Git from PowerShell in this folder:

```powershell
git init
git add .
git commit -m "Prepare NLP summarizer for deployment"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/text-summarization-nlp.git
git push -u origin main
```

If Git asks, sign in to GitHub in the browser.

## 2. Deploy on Render

1. Sign in at https://render.com/ and connect your GitHub account.
2. Choose **New + → Blueprint**.
3. Select the repository you just pushed.
4. Render detects `render.yaml`. Review and create the service using the **Free** plan.
5. Wait for the build and deploy to finish. The build downloads the required NLTK datasets into `nltk_data/`.
6. Open the generated `https://YOUR-SERVICE.onrender.com/` URL and test the app.

The Blueprint configures:
- Build: install `requirements.txt` and download NLTK datasets.
- Start: `gunicorn app:app --workers 1 --threads 4 --timeout 120`.
- Health check: `/health`.
- A generated Flask `SECRET_KEY`.

## 3. Configure OCR (needed for images and scanned PDF pages)

The app uses the OCR.space API for image uploads and as a fallback for scanned PDF pages. Text-based PDFs can be processed without this key.

1. Get an API key from https://ocr.space/ocrapi.
2. In Render, open your service → **Environment** → **Add Environment Variable**.
3. Add `OCR_API_KEY` with your OCR.space key and save. Render will redeploy.

Do not commit the API key to GitHub or put it in the Cloudflare Worker.

## 4. Create a free Cloudflare URL

Render's free service URL is `*.onrender.com`. To use a Cloudflare `*.workers.dev` URL without buying a domain, deploy the included reverse-proxy Worker:

1. Sign in at https://dash.cloudflare.com/.
2. Open **Workers & Pages** → **Create** → **Create Worker**.
3. Give it a name, e.g. `text-summarizer-proxy`, and deploy the starter Worker.
4. Open the Worker → **Edit code**.
5. Replace the editor contents with `cloudflare-worker/worker.js` from this repository.
6. Replace `https://YOUR-RENDER-SERVICE.onrender.com` in the first line with your actual Render service URL (no trailing slash).
7. Save and deploy.
8. In the Worker settings/domains area, ensure the `workers.dev` subdomain is enabled. Open the displayed URL, usually `https://text-summarizer-proxy.YOUR-SUBDOMAIN.workers.dev`.

The Worker forwards the incoming path, query string, headers, and request body to Render. It does not host the Python app itself; Render still runs the summarization and OCR logic.

## 5. Test

- Open the Cloudflare `workers.dev` URL.
- Upload a normal text-based PDF and confirm a summary appears.
- Upload an image only after setting `OCR_API_KEY`.
- Test a scanned PDF only after setting `OCR_API_KEY`.
- Check `https://YOUR-SERVICE.onrender.com/health` if the app appears unavailable.

## Free-tier notes

- Render Free web services spin down after 15 minutes without inbound traffic. The first request after sleeping can take around a minute to wake up.
- Render's free filesystem is ephemeral. This app stores uploads temporarily and deletes them after processing; do not add permanent user-file storage without a separate storage service.
- Cloudflare's `workers.dev` URL is a Worker URL, not a custom domain or a direct Render URL. The Worker above proxies requests to Render.
- Free-tier limits and availability can change; check the providers' current plan pages.
