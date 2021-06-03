import { ERC20TokenDetailed, EthereumTokenType, useWallet } from '@dimensiondev/web3-shared'
import { useAsyncRetry } from 'react-use'
import { PluginServices } from '../../../API'

export function useERC20TokensPaged(index: number, count: number) {
    const wallet = useWallet()
    return useAsyncRetry(async () => {
        if (!wallet)
            return {
                tokens: [],
                count: 0,
            }
        const recordCount = await PluginServices.Wallet.getERC20TokensCount()
        const erc20Tokens = await PluginServices.Wallet.getERC20TokensPaged(index, count)
        return {
            tokens: erc20Tokens
                .map<ERC20TokenDetailed>((x) => ({
                    type: EthereumTokenType.ERC20,
                    ...x,
                }))
                .filter(
                    (x) => wallet.erc20_token_whitelist.has(x.address) && !wallet.erc20_token_blacklist.has(x.address),
                ),
            count: recordCount,
        }
    }, [index, count, wallet])
}
