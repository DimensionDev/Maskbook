import type { ChainId } from '@masknet/web3-shared-evm'
import { EVMContractReadonly } from '../Web3/EVM/apis/ContractReadonlyAPI.js'

export async function getContractSymbol(chainId: ChainId, address: string) {
    try {
        const contract = EVMContractReadonly.getERC721Contract(address)
        const symbol = await EVMContractReadonly.readContract(contract, 'symbol', [], { chainId })
        return symbol ?? ''
    } catch {
        return ''
    }
}
