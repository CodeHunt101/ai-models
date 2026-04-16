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

Build image:

```bash
docker build -t openai-models .
```

Run container:

```bash
docker run --env-file .env.local -p 3001:3001 openai-models
```
