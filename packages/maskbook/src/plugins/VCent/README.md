# Tweet Plugin for Mask Network integration with Valuables

Tweet is a Mask plugin integrating with Valuables API to directly display the
current bid price of each tweet within each tweet card, provided an offer has
been made.

## Plugin Usage

Youtube Plugin Demo: <https://youtu.be/oZhVUIXFUPU>

The plugin is located in

`Maskbook\packages\maskbook\src\plugins\Tweet`

The file tree for this plugin is as follows:\
\
Tweet\
| constants.ts\
| define.tsx\
| README.md\
|\
+---apis\
| index.ts (This fetches the tweet information)\
|\
+---Icons\
| ETH.tsx\
| icons.tsx\
| VCent.tsx\
|\
\---UI\
 TweetDialog.tsx (This displays the information in Twitter)

## Issues

Error#1: Access to fetch at
<https://v.cent.co/data/tweet-txm?tweetID=(TweetIdHere)> from origin
<https://twitter.com> has been blocked by CORS policy: No
'Access-Control-Allow-Origin' header is present on the request source.

Current workaorund to Error#1: Allow CORS: Access-Control-Allow-Origin plugin
for Chrome.

## Contact

Discord: rob-lw#4479\
Gitcoin: <https://gitcoin.co/rob-lw>\
Github: <https://github.com/rob-lw>
