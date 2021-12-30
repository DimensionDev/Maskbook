import { useAsyncRetry } from 'react-use'
import { useERC721TokenContract } from '../contracts/useERC721TokenContract'
import { safeNonPayableTransactionCall } from '../utils'
import { EthereumAddress } from 'wallet.ts'
import { useChainId } from './useChainId'

export function useERC721ContractBalance(address: string | undefined, account: string) {
    const chainId = useChainId()
    const erc721TokenContract = useERC721TokenContract(address)
    return useAsyncRetry(async () => {
        if (!address || !EthereumAddress.isValid(account) || !EthereumAddress.isValid(address) || !erc721TokenContract)
            return
        return safeNonPayableTransactionCall(erc721TokenContract.methods.balanceOf(account))
    }, [address, chainId, erc721TokenContract, account])
}
