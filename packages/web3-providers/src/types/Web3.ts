export namespace Web3BaseAPI {
    export interface Provider<ChainId, AddressType, Web3> {
        /** Create an interactive Web3 SDK instance from the given chain ID. */
        createSDK(chainId: ChainId): Web3
        /** Get address type of the given one. */
        getAddressType(chainId: ChainId, address: string): Promise<AddressType | undefined>
    }
}
