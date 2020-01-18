import Web3 from 'web3'

export const provider = ((globalThis as any).web3 as Web3)?.currentProvider
export const web3 = new Web3(provider!)
