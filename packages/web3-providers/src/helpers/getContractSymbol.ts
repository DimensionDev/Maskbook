import { type ChainId } from '@masknet/web3-shared-evm'
import { ContractReadonlyAPI } from '../Web3/EVM/apis/ContractReadonlyAPI.js'

export async function getContractSymbol(chainId: ChainId, address: string) {
    try {
        const symbol = await new ContractReadonlyAPI()
            .getERC721Contract(address, { chainId })
            ?.methods.symbol()
            .call({})
        return symbol ?? ''
    } catch {
        return ''
    }
}
