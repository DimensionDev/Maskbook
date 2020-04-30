export interface ERC20Token {
    decimals: number
    symbol: string
    name: string
    address: string
}

export type ERC20TokenPredefinedData = ERC20Token[]

export const DAI_ADDRESS = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
export const OKB_ADDRESS = '0x75231f58b43240c9718dd58b4967c5114342a86c'
