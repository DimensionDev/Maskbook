import { ERC20TokenDetailed, EthereumTokenType, useWallet } from '@dimensiondev/web3-shared'
import { useAsyncRetry } from 'react-use'
import { PluginServices } from '../../../API'

export function useERC20TokensPaged(index: number, count: number) {
    const wallet = useWallet()
    return useAsyncRetry(async () => {
        if (!wallet) return []
        const erc20Tokens = await PluginServices.Wallet.getERC20TokensPaged(index, count)
        return erc20Tokens
            .map<ERC20TokenDetailed>((x) => ({
                type: EthereumTokenType.ERC20,
                ...x,
            }))
            .filter((x) => wallet.erc20_token_whitelist.has(x.address) && !wallet.erc20_token_blacklist.has(x.address))
    }, [index, count, wallet])
}
