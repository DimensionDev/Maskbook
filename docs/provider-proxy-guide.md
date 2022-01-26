## Why

Currently, we use a lot of third-party data sources, the stability of the data source and changes may lead to abnormalities in the operation of the plug-in, in view of the delay in the release of the plug-in, we can not respond to changes in a timely manner, so through the proxy to solve this problem.

## Architecture

## How to write a producer

### producer interface

```typescript
export interface RPCMethodRegistrationValue<T, TArgs> {
  method: string // Method name when called by client
  producer(push: ProducerPushFunction<T>, getKey: ProducerKeyFunction, args: TArgs): Promise<void> // Data Processor
  distinctBy(item: T): string //De-duplication lambda
}
```

You can get data from one or more data providers in the producer and push it to the websocket using the `push` method, you can push it once or more, the websocker server will keep calling distinctBy to de-duplicate it and push it to the client

`packages/provider-proxy/src/producers` are existing producers.

## How to deploy

### Development environment

Currently, we have trigger packaged producer ci again [GitHub action](https://github.com/DimensionDev/Maskbook/actions/workflows/deploy-proxy.yml), if necessary, you can go trigger packaged.
The GitHub action of hyper-proxy will check for new packages every 15 minutes and deploy to dev environment

### Production environment

will be deployed manually at release time

## Debug on local

1. Install [Miniflare](https://miniflare.dev/get-started/cli)
2. Clone [Hyper proxy](https://github.com/DimensionDev/hyper-proxy) in to local
   ```shell
   git clone https://github.com/DimensionDev/hyper-proxy.git
   ```
3. Run `npm install && npm run dev`
4. if you develop Maskbook, you can change dependency to your `maskbook/packages/provider-proxy/dist`.
