# Ethereum Follow Protocol plugin

## TODOs

- Detect direct `ethfollow.xyz` and `efp.app` profile/list links in supported post content.
- Render a compact Ethereum Follow Protocol profile card in Twitter/X posts.
- Fetch profile/list details from the EFP data API and keep a URL-derived fallback card when the API fails.
- Use EFP-generated images for profile and Top 8 previews.

## Referenced resources

- https://efp.app
- https://docs.efp.app
- https://data.ethfollow.xyz/api/v1
- https://github.com/ethereumfollowprotocol/app
- https://github.com/ethereumfollowprotocol/api-v2

## Known issues / Caveats

- The card intentionally accepts only direct one-segment profile/list URLs with an optional `topEight=true` query.
- Reserved EFP app routes such as `/api`, `/og`, `/assets`, `/leaderboard`, `/integrations`, `/team`, and `/swipe` are ignored.
- The embed uses EFP-generated preview images instead of arbitrary ENS avatar or header records to keep CSP changes narrow.
