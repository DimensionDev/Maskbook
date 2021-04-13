# Valuables Plugin

Ideamarket.io <https://ideamarket.io>

Bounty: <https://gitcoin.co/issue/Ideamarket/gitcoin-bounties/19/100025258>

## Description

Render a small button next to each tweet, and when hovering or clicking it, show relevant twitter users ideamarket token stats (price, rank, 24h change).

Project has a subgraph that you can query deployed at: <https://subgraph.backend.ideamarket.io:8080/subgraphs/name/Ideamarket/Ideamarket>

### Components

Rendering logic (inside `/UI` directory):
Each tweet has a `<LogoButton>` that's passed a username prop.
That component renders a `<Listing>` when hovered on or clicked.
Then `<Listing>` queries the graphQL endpoint,
and returns `<Loading>`
if loading, `<Listed>`
if listing is found, or `<NotListed>` if it isn't.

### Improvements

I initially tried to use [Apollo](https://github.com/apollographql/apollo-client) for quering the subgraph, which would've been useful because the client caches data that's already been queried. Unfortunately there's a bug with Apollo & CORS that I didn't find a workaround too yet.

[graphql-request](https://github.com/prisma-labs/graphql-request) is used instead, which works well but without the caching abilities.

### Issues

CORS problems with API. No Access-Control-Allow-Origin header returned.

Ideamarket logo as SvgIcon looks a bit funky currently.. :')
