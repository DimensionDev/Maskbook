import { useAsyncRetry } from 'react-use'
import { EthereumAddress } from 'wallet.ts'
import { useChainId } from '.'
import { useERC20TokenContract } from '..'

export function useERC20TokenTotalSupply(address?: string) {
    const chainId = useChainId()
    const erc20TokenContract = useERC20TokenContract(address)
    return useAsyncRetry(async () => {
        if (!address) return
        if (!EthereumAddress.isValid(address)) return
        return erc20TokenContract?.methods.totalSupply().call()
    }, [chainId, address, erc20TokenContract])
}
