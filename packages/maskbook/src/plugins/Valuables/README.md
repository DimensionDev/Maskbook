# Valuables Plugin

Valuables by CENT [https://v.cent.co/](https://v.cent.co/)

## Description

Check for latest bids on tweets, and if found, render them on twitter post.

API endpoint: [https://v.cent.co/data/tweet-txn/latest?tweetID=<TWEETID>
](https://v.cent.co/data/tweet-txn/latest?tweetID=<TWEETID>
)

Most rendering logic resides in UI/BidCard.tsx, fetching is currently done in api.tsx.

### Improvements

ETH text could be replaced by an ethereum logo instead. Also rendering with images and in quote tweets could be improved.

### Issues

CORS problems with API. No Access-Control-Allow-Origin header returned. Might be because I'm fetching from localhost, and not in production and from twitter.com. Local development workaround: [Moesif CORS
](https://chrome.google.com/webstore/detail/moesif-origin-cors-change/digfbfaphojjndkpccljibejjbppifbc)
