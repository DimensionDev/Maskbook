# Tweet Plugin for Mask Network integration with Valuables

Tweet is a Mask plugin integrating with Valuables API to directly display the
current bid price of each tweet within each tweet card, provided an offer has
been made.

## Plugin Usage

Youtube Plugin Demo: <https://youtu.be/oZhVUIXFUPU>

The plugin is located in

`Mask\packages\maskbook\src\plugins\Tweet`

The file tree for this plugin is as follows:

```plaintext
Tweet\
| constants.ts\ (This holds plugin definitions)
| define.tsx\ (Main entry point)
| README.md\
|\
+---apis\
| index.ts (This fetches the tweet information)\
|\
+---icons\ (icons in SVG format)
| ETH.tsx\
| VCent.tsx\
|\
\---UI\
 TweetDialog.tsx (This displays the information in Twitter)
```
