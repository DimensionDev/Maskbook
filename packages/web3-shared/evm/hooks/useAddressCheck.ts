import { useAsync } from 'react-use'
import type { AbiItem } from 'web3-utils'
import { useERC721TokenContract } from '../contracts'
import { createContract } from './useContract'
import { useWeb3 } from './useWeb3'
import ERC1155 from '@masknet/web3-contracts/abis/ERC1155.json'
import { useERC165 } from '.'

const ERC721_ENUMERABLE_INTERFACE_ID = '0x780e9d63'
const ERC1155_ENUMERABLE_INTERFACE_ID = '0xd9b67a26'

function useCheckContract(address: string) {
    const web3 = useWeb3()
    return useAsync(async () => {
        const result = await web3.eth.getCode(address)
        return result !== '0x'
    }, [address]).value
}

function useCheckERC721(address: string) {
    const erc721Contract = useERC721TokenContract(address)
    return useERC165(erc721Contract, address, ERC721_ENUMERABLE_INTERFACE_ID)
}

function useCheckERC1155(address: string) {
    const web3 = useWeb3()
    const erc1155Contract = createContract(web3, address, ERC1155 as AbiItem[])
    return useERC165(erc1155Contract, address, ERC1155_ENUMERABLE_INTERFACE_ID)
}

export function useAddressCheck(address: string) {
    const isContract = useCheckContract(address)
    const { value: isERC721, loading: loadingERC721 } = useCheckERC721(address)
    const { value: isERC1155, loading: loadingERC1155 } = useCheckERC1155(address)

    if (loadingERC1155 || loadingERC721) return
    return isERC1155 ? 'ERC1155' : isERC721 ? 'ERC721' : isContract ? 'ERC20' : ''
}
