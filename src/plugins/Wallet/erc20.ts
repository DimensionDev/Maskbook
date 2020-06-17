export interface ERC20Token {
    decimals: number
    symbol: string
    name: string
    address: string
}

export type ERC20TokenPredefinedData = ERC20Token[]

export const ETH_ADDRESS = '0x0000000000000000000000000000000000000000'
export const GITCOIN_ETH_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
export const DAI_ADDRESS = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
export const OKB_ADDRESS = '0x75231f58b43240c9718dd58b4967c5114342a86c'
export const USDT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
export const UDDT_RINKEBY_ADDRESS = '0xf88Bf61674BA3eD8B55a15f820CA8C2228953d08'
