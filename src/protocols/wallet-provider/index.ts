export { provider as MaskbookWalletProvider } from './maskbook'
export {} from './metamask'
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
}
