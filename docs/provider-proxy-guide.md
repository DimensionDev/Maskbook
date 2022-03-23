# Provider Proxy Guideline

## Why

Currently, we use a lot of third-party data sources, the stability of the data source and changes may lead to abnormalities in the operation of the plug-in, in view of the delay in the release of the plug-in, we can not respond to changes in a timely manner, so through the proxy to solve this problem.

## Architecture

![image](https://user-images.githubusercontent.com/19925717/159650079-43773772-b832-4358-96b8-bb0516fcf2bc.png)

## How to write a producer

### producer interface

```typescript
export interface RPCMethodRegistrationValue<T, TArgs> {
  method: string // Method name when called by client
  producer(push: ProducerPushFunction<T>, getKey: ProducerKeyFunction, args: TArgs): Promise<void> // Data Processor
  distinctBy(item: T): string //De-duplication lambda
}
```

You can get data from one or more data providers in the producer and push it to the WebSocket using the `push` method, you can push it once or more, the WebSocket server will keep calling distinctBy to de-duplicate it and push it to the client.

`packages/provider-proxy/src/producers` are existing producers.

## How to deploy

Deployment requires two steps:

1. Build package
2. Hyper proxy deploy the package

### Development environment

Currently, we have trigger packaged producer ci in [GitHub action](https://github.com/DimensionDev/Maskbook/actions/workflows/deploy-proxy.yml), you can go and trigger packaged.
The GitHub action of hyper-proxy's repository will check for new packages every 15 minutes and deploy to dev environment.

### Production environment

Production environment will be deployed manually at release time

## Debug on local

1. Install [Miniflare](https://miniflare.dev/get-started/cli).
2. Clone [Hyper proxy](https://github.com/DimensionDev/hyper-proxy) in to local.
   ```shell
   git clone https://github.com/DimensionDev/hyper-proxy.git
   ```
3. Run `pnpm build && node ./packages/provider-proxy/build.mjs` in Maskbook repository.
4. Run `npm link {path-to-repo}/maskbook/packages/provider-proxy/dist`.
5. Run `npm install && npm run dev`.
