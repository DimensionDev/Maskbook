export interface ERC20Token {
    decimals: number
    symbol: string
    name: string
    address: string
}

export type ERC20TokenPredefinedData = ERC20Token[]

export const ETH_ADDRESS = '0x0000000000000000000000000000000000000000'
export const DAI_ADDRESS = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
export const OKB_ADDRESS = '0x75231f58b43240c9718dd58b4967c5114342a86c'

const isSameAddr = (addrA: string, addrB: string) => addrA.toLowerCase() === addrB.toLowerCase()
export const isDAI = (addr: string) => isSameAddr(addr, DAI_ADDRESS)
export const isOKB = (addr: string) => isSameAddr(addr, OKB_ADDRESS)
