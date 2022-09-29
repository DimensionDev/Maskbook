export namespace DomianAPI {
    export interface Provider<ChainId, SchemaType> {
        lookup(name: string, chainId: ChainId): Promise<string | undefined>
        reverse(address: string, chainId: ChainId): Promise<string | undefined>
    }
}
