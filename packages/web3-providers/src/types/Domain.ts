export namespace DomainAPI {
    export interface Provider<ChainId> {
        lookup(name: string, chainId: ChainId): Promise<string | undefined>
        reverse(address: string, chainId: ChainId): Promise<string | undefined>
    }
}
