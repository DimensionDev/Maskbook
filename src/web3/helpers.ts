import { DAI_ADDRESS, OKB_ADDRESS, USDT_ADDRESS, USDT_RINKEBY_ADDRESS } from './constants'

export const isSameAddr = (addrA: string, addrB: string) => addrA.toLowerCase() === addrB.toLowerCase()
export const isDAI = (addr: string) => isSameAddr(addr, DAI_ADDRESS)
export const isOKB = (addr: string) => isSameAddr(addr, OKB_ADDRESS)
export const isUSDT = (addr: string) => isSameAddr(addr, USDT_ADDRESS) || isSameAddr(addr, USDT_RINKEBY_ADDRESS)
