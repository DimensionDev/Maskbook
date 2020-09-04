import type { AbstractProvider, HttpProvider, IpcProvider, WebsocketProvider } from 'web3-core'

export { MaskbookProvider as maskbookProvider } from './maskbook'
export { MetaMaskProvider as metamaskProvider } from './metamask'
/** https://docs.metamask.io/guide/rpc-api.html */
export interface EthereumAPI {
    eth_requestAccounts(): string[]
    eth_getBalance(account: string, type: 'latest' | 'earliest' | 'pending'): string
}
export interface WalletProvider {
    /** Check if the provider is available. */
    checkAvailability(): Promise<boolean>
    /**
     * Get a list of wallets.
     * This methods need user intention on external wallets!
     */
    requestAccounts(): Promise<string[]>
    getWeb3Provider(): HttpProvider | IpcProvider | WebsocketProvider | AbstractProvider
    /**
     * When this function called, the provider should do some clean up like ".disconnect()" to release the resource
     */
    noLongerUseWeb3Provider?(): void
}
