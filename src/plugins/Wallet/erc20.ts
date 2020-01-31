export interface ERC20Token {
    decimals: number
    symbol: string
    name: string
    address: string
}

export type ERC20TokenPredefinedData = ERC20Token[]

export function isDAI({ address }: ERC20Token) {
    return address === '0x6B175474E89094C44Da98b954EedeAC495271d0F'
}
