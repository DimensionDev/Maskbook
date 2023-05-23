import { type ChainId, createContract } from '@masknet/web3-shared-evm'
import type { AbiItem } from 'web3-utils'
import ERC721ABI from '@masknet/web3-contracts/abis/ERC721.json'
import { Web3API } from '../Connection/index.js'
import type { ERC721 } from '@masknet/web3-contracts/types/ERC721.js'

const Web3 = new Web3API()

export async function getContractSymbol(chainId: ChainId, address: string) {
    try {
        const web3 = Web3.getWeb3(chainId)
        const contract = createContract<ERC721>(web3, address, ERC721ABI as AbiItem[])
        const symbol = await contract?.methods.symbol().call({})
        return symbol ?? ''
    } catch {
        return ''
    }
}
