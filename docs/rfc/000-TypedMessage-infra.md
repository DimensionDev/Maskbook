# TypedMessage infra roadmap

To enable rich content editing in the Mask Network extension, we should develop the infra of TypedMessage.

## Parser

This part should parse the post discovered by the Mask into a TypedMessage format.

For example, if we see a tweet with a picture, it should parse the content into the following.

```plaintext
TypedMessageCompound {
    items: [
        TypedMessageText {
            text: "content of the raw tweet"
        },
        TypedMessageImage {
            src: "url of the image"
        }
    ]
}
```

This part is required by the Pipe section. This part is not difficult because most of the SNS does not support too much content types.

## Editor

An intuitive editor for users to compose the rich content and the underlying data model should based on TypedMessage.

## Renderer

To render the TypedMessage.

## Pipe

Ideally, the data should flow in the way:

```plaintext
Raw data on the web page
    ⬇ PostProvider in SNS adaptor
Text("Encrypted with Mask! https://t.co/...")
    ⬇ Mask Network decryptor
Compound[Text("Encrypted with Mask! "), Deferred(0)]
    ⬇ Renderer
Render on the screen: Encrypted with Mask! (Mask is decrypting...)
    ⬇ Deferred id=0 successfully resolved
Compound[Text("Encrypted with Mask! "), Text("Secret content!", metadata)]
    ⬇ Renderer
Render on the screen: Encrypted with Mask! Secret content!
And plugins called if related meta has found.
```
