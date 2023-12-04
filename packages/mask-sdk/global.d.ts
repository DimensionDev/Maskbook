declare const Mask: undefined | typeof import('./dist/public-api/index.ts').Mask
interface Window {
    Mask?: typeof Mask
}
interface WindowEventMap {
    'eip6963:requestProvider': Event
    'eip6963:announceProvider': CustomEvent<import('./dist/public-api/mask-wallet.d.ts').Ethereum.EIP6963ProviderDetail>
}
