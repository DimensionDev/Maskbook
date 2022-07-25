export namespace TokenAPI {
    export interface TokenInfo {
        id: string
        market_cap: string
        price: string
    }
    export interface Provider {
        getTokenInfo(tokenName: string): Promise<TokenInfo | undefined>
    }
}
