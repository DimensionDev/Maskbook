import { type ChainId } from '@masknet/web3-shared-evm'
import { EVMContractReadonly } from '../Web3/EVM/apis/ContractReadonlyAPI.js'

export async function getContractSymbol(chainId: ChainId, address: string) {
    try {
        const symbol = await EVMContractReadonly.getERC721Contract(address, { chainId })?.methods.symbol().call({})
        return symbol ?? ''
    } catch {
        return ''
    }
}
