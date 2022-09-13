export namespace TokenIconAPI {
    export interface Provider<ChainId> {
        getFungibleTokenIconURLs?: (chainId: ChainId, address: string) => Promise<string[]>
    }
}
