export namespace DomainAPI {
    export interface Provider<ChainId> {
        lookup(chainId: ChainId, name: string): Promise<string | undefined>
        reverse(chainId: ChainId, address: string): Promise<string | undefined>
    }
}
