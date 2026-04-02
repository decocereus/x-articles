# xtract

Paste a public X post or article URL and get clean, agent-ready markdown in one click.

## Why

Copying bookmarked X posts and long-form articles into an agent workflow is too manual.
`xtract` starts as a tiny web app that:

- accepts a public URL
- extracts the readable content server-side
- returns markdown, plain text, and JSON
- keeps the output easy to copy into Codex, Claude, ChatGPT, or any other agent

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Mozilla Readability
- JSDOM
- Turndown

## Local Development

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Configuration

`xtract` uses a canonical site URL for metadata, `robots.txt`, and `sitemap.xml`.

Environment variables:

- `NEXT_PUBLIC_SITE_URL`: public base URL for the deployed app
- `SITE_URL`: optional server-only override if you do not want to expose the same value client-side

For local development, `.env.example` defaults to `http://localhost:3000`.

## Current Scope

- public web article extraction
- public X post extraction
- one-click copy for markdown, text, or JSON
- lightweight analytics and error telemetry
- MIT licensed

## Observability

- [Vercel Analytics](https://vercel.com/analytics) is wired in for page-level traffic trends
- [Vercel Speed Insights](https://vercel.com/docs/speed-insights) is wired in for Core Web Vitals and performance regressions
- client runtime crashes are posted to `/api/telemetry` and written to server logs
- extraction successes and failures are logged with structured metadata and request IDs

For deployed projects, enable Web Analytics and Speed Insights in the Vercel dashboard to see the data.

## Known Limitations

- only public URLs are supported
- X extraction depends on X web endpoints, which can change without notice
- some article pages block bots, dynamic rendering, or readability parsing and may fail to extract

## Next Likely Steps

- improve X-specific extraction coverage
- add bookmarklet / browser extension flow
- add a CLI so agents can fetch links directly

## License

[MIT](./LICENSE)
