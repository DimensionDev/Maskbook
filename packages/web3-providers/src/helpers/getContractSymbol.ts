import { type ChainId } from '@masknet/web3-shared-evm'
import { ContractAPI } from '../Web3/EVM/apis/ContractAPI.js'

const Contract = new ContractAPI()

export async function getContractSymbol(chainId: ChainId, address: string) {
    try {
        const symbol = await Contract.getERC721Contract(address, { chainId })?.methods.symbol().call({})
        return symbol ?? ''
    } catch {
        return ''
    }
}
