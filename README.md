ClipFlow is an AI-assisted video production workflow tool.

Bring your own AI subscriptions.

Supports creators who already use Gemini, Claude, or ChatGPT.

## What is ClipFlow?

ClipFlow helps video creators turn long-form transcripts into short-form
clip candidates with the help of AI. Rather than bundling AI costs into a
subscription, ClipFlow follows a **BYOAI (Bring Your Own AI)** model: you
connect your own AI provider, and every request is billed directly by that
provider.

> ClipFlow does not provide AI credits.
> You use your own AI subscription / API key.
> API pricing depends on the provider.

## Features (MVP / v0.1.0-alpha)

- **BYOAI** — connect your own AI provider. Your API key is stored only in
  your browser and is never sent to a ClipFlow server.
- **Gemini API support** — currently supports Google Gemini models.
- **Transcript analysis** — paste a transcript (timestamps optional) and let
  AI find the highlights.
- **Clip candidate generation** — get suggested clip segments with hook
  titles and the reason each moment was picked.
- **Title & description generation** — draft titles and descriptions for the
  clips you choose.

This is an early alpha. Features are evolving and some are still in progress.

## Getting started

1. Get a Gemini API key from
   [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Open **Settings** and paste your key. It is saved only in your browser
   (BYOAI) and never leaves your device except to call the AI provider
   directly.
3. Pick a model, then run the connection test to confirm your key works.

## Development

ClipFlow is a Next.js web application.

### Install

```bash
pnpm install
```

### Run (development)

```bash
pnpm dev
```

### Build

```bash
pnpm build
```
