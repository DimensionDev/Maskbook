# Social Network Adaptors of Mask Network

To support a new network, you can refer our adaptor for [Facebook](./facebook.com) and [Twitter](./twitter.com).

You should follow the structure as following:

```plaintext
./some-network.com
    index.ts
    base.ts
    shared.ts
    ui-provider.ts
    worker-provider.ts
```

⚠ If you're going to support decentralized network like Mastdon, please contact `@Jack-Works`.

The current architecture is not friendly to that kind of SNS.
