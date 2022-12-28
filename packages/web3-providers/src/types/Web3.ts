export namespace Web3BaseAPI {
    export interface Provider<ChainId, AddressType, Provider, Web3> {
        /** Create an interactive Web3 SDK instance from the given chain ID. */
        createWeb3(chainId: ChainId): Web3
        /** Create an Web3 provider from the given chian ID. */
        createProvider(chainId: ChainId): Provider
        /** Get address type of the given one. */
        getAddressType(chainId: ChainId, address: string): Promise<AddressType | undefined>
    }
}
