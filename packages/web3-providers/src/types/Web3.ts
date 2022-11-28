export namespace Web3BaseAPI {
    export interface Provider<ChainId, Web3> {
        /** Create an interactive Web3 SDK instance from the given chain ID. */
        createSDK(chainId: ChainId): Web3
    }
}
