import { useAsync } from 'react-use'
import { useERC721TokenContract } from '../contracts'
import { useWeb3 } from './useWeb3'

const ERC721_ENUMERABLE_INTERFACE_ID = '0x780e9d63'
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

function useGetSymbol(address: string) {
    const erc721TokenContract = useERC721TokenContract(address)
    return useAsync(async () => {
        return erc721TokenContract?.methods.symbol().call()
    }, [erc721TokenContract]).value
}

export function useAddressCheck(address: string) {
    const isContract = useCheckContract(address)
    const isERC721 = useCheckERC721(address)
    const symbol = useGetSymbol(address)

    if (isContract && isERC721 && symbol === 'ERC1155') {
        return 'ERC1155'
    } else if (isContract && isERC721 && symbol !== 'ERC1155') {
        return 'ERC721'
    }
    return 'ERC20'
}
