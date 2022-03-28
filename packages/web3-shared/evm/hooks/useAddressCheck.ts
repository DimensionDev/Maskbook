import { useAsync } from 'react-use'
import type { AbiItem } from 'web3-utils'
import { useERC721TokenContract } from '../contracts'
import { createContract } from './useContract'
import { useWeb3 } from './useWeb3'
import ERC1155 from '@masknet/web3-contracts/abis/ERC1155.json'

const ERC721_ENUMERABLE_INTERFACE_ID = '0x780e9d63'
const ERC1155_ENUMERABLE_INTERFACE_ID = '0xd9b67a26'
                                                                                   '
function useCheckContract(address: string) {
    const web3 = useWeb3()
    return useAsync(async () => {
        const result = await web3.eth.getCode(address)
        return result !== '0x'
    }, [address]).value
}

function useCheckERC721(address: string) {
    const erc721TokenContract = useERC721TokenContract(address)
    return useAsync(async () => {
        return erc721TokenContract?.methods.supportsInterface(ERC721_ENUMERABLE_INTERFACE_ID).call()
    }, [erc721TokenContract]).value
}

function useCheckERC1155(address: string) {
    const web3 = useWeb3()
    const erc1155Contract = createContract(web3, address, ERC1155 as AbiItem[])
    return useAsync(async() => {
        return erc1155Contract?.methods.supportsInterface(ERC1155_ENUMERABLE_INTERFACE_ID).call()
    }, [erc1155Contract])
}

export function useAddressCheck(address: string) {
    const isContract = useCheckContract(address)
    const isERC721 = useCheckERC721(address)
    const isERC1155 = useCheckERC1155(address)

    if (isContract && isERC1155) return 'ERC1155'
    if (isContract && isERC721) return 'ERC721'
    return 'ERC20'
}
