A personal project where I utilise the main OpenAI and Deepseek API premium models. <b>Calling the API is way less pricey than paying for premium subscriptions!</b>

Since this is a paid API, if you would like access, please email me at `haroldtm55@gmail.com`, and I'll grant you free access.

This is a [Next.js](https://nextjs.org/) `15.5.15` App Router project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

### Example using `gpt-4o` text generation model

Provides text outputs in response to their inputs.

<img src="https://live.staticflickr.com/65535/53603048265_54d82194a1_o.png" alt="Example Image" width="800">

### Example using `gpt-4o` vision model

Upload an image and it will answer any questions about it.

<img src="https://live.staticflickr.com/65535/53602921984_c5d1cd20b0_h.png" alt="Example Image" width="800">

### Example using `dall-e-3` image generation model

Create images from scratch based on a text prompt.

<img src="https://live.staticflickr.com/65535/53602790783_405578e444_b.png" alt="Example Image" width="800">

### Example using `whisper-1` speech-to-text model

Transcribe audio into whatever language the audio is in.

<img src="https://live.staticflickr.com/65535/53624101944_4df1d72363_o.png" alt="Example Image" width="800">

### Example use the `Assistant API` to build an Associate Cloud Engineer Assistant

Upload any screenshot containing an ACE exam question and it will give you the answer.

<img src="https://live.staticflickr.com/65535/53623768971_eec8f33451_o.png" alt="Example Image" width="800">

## Getting Started in Local

Note: Since this is a paid API, you need an access key. Feel free to contact me and I'll provide you with one.

Install dependencies and run development server:

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.

## Docker

### Build image locally

```bash
docker build -t openai-models .
```

Run image locally (with runtime env):

```bash
docker run --env-file .env.local -p 3001:3001 openai-models
```

### Production deploy on VM (recommended)

Use Docker Compose + runtime env file. Do not bake secrets into image.

One-time VM setup:

```bash
mkdir -p ~/openai-models-deploy
cd ~/openai-models-deploy
```

Copy deployment files from this repo to VM deploy directory:

```bash
scp -i openai-models-oracle.key docker-compose.prod.yml ubuntu@<VM_IP>:~/openai-models-deploy/
scp -i openai-models-oracle.key scripts/deploy-vm.sh ubuntu@<VM_IP>:~/openai-models-deploy/
scp -i openai-models-oracle.key .env.openai-models.example ubuntu@<VM_IP>:~/openai-models-deploy/.env.openai-models
```

On VM, edit env values:

```bash
cd ~/openai-models-deploy
nano .env.openai-models
```

Required values:
- `OPENAI_API_KEY`
- `AUTH0_SECRET`
- `AUTH0_BASE_URL` (must be public app URL, e.g. `http://152.67.112.83:3001`)
- `AUTH0_ISSUER_BASE_URL` (must be valid URL, e.g. `https://your-tenant-region.auth0.com`)
- `AUTH0_CLIENT_ID`
- `AUTH0_CLIENT_SECRET`
- `DEEPSEEK_BASE_URL`
- `DEEPSEEK_API_KEY`

Important:
- Keep values unquoted (no wrapping `'...'` or `"..."`).
- Keep `.env.openai-models` on VM only.

Run deploy on VM:

```bash
cd ~/openai-models-deploy
chmod +x deploy-vm.sh
./deploy-vm.sh
```

### Normal update flow (next time)

1. Push code to GitHub.
2. Wait for GitHub Action to build and push `haroldtm55/openai-models:latest`.
3. SSH to VM and run:

```bash
cd ~/openai-models-deploy
./deploy-vm.sh
```

Quick checks on VM:

```bash
docker compose -f docker-compose.prod.yml ps
curl -I http://localhost:3001/api/auth/login
```
