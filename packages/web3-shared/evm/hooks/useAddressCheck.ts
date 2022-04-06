import { useAsyncRetry } from 'react-use'
import type { AbiItem } from 'web3-utils'
import { useERC721TokenContract } from '../contracts'
import { createContract } from './useContract'
import { useWeb3 } from './useWeb3'
import ERC1155 from '@masknet/web3-contracts/abis/ERC1155.json'
import { useERC165 } from '.'
import { EthereumTokenType } from '../types'

const ERC721_ENUMERABLE_INTERFACE_ID = '0x780e9d63'
const ERC1155_ENUMERABLE_INTERFACE_ID = '0xd9b67a26'

function useCheckContract(address: string) {
    const web3 = useWeb3()
    return useAsyncRetry(async () => {
        const result = await web3.eth.getCode(address)
        return result !== '0x'
    }, [address])
}

function useCheckERC721(address: string) {
    const erc721Contract = useERC721TokenContract(address)
    return useERC165(erc721Contract, address, ERC721_ENUMERABLE_INTERFACE_ID)
}

function useERC1155TokenContract(address: string) {
    const web3 = useWeb3()
    return createContract(web3, address, ERC1155 as AbiItem[])
}

function useCheckERC1155(address: string) {
    const erc1155Contract = useERC1155TokenContract(address)
    return useERC165(erc1155Contract, address, ERC1155_ENUMERABLE_INTERFACE_ID)
}

export function useAddressCheck(address: string): EthereumTokenType | undefined {
    const { value: isContract, loading: loadingContract } = useCheckContract(address)
    const { value: isERC721, loading: loadingERC721 } = useCheckERC721(address)
    const { value: isERC1155, loading: loadingERC1155 } = useCheckERC1155(address)

    if (loadingERC1155 || loadingERC721 || loadingContract) return
    return isERC1155
        ? EthereumTokenType.ERC1155
        : isERC721
        ? EthereumTokenType.ERC721
        : isContract
        ? EthereumTokenType.ERC20
        : undefined
}
