import { Web3ProviderType, createWeb3, createContract } from '@masknet/web3-shared-evm'
import type { Web3Plugin } from '@masknet/plugin-infra'
import { AbiItem, toHex } from 'web3-utils'
import ERC20ABI from '@masknet/web3-contracts/abis/ERC20.json'

export function createGetTokenBalance(context: Web3ProviderType) {
    return (token: Web3Plugin.FungibleToken, account: string) => {
        const web3 = createWeb3(context.request, () => ({
            chainId: token.chainId,
        }))
        if (token.isNativeToken) {
            return web3.eth.getBalance(account)
        } else {
            const erc20Contract = createContract(web3, token.address, ERC20ABI as AbiItem[])
            if (!account || !erc20Contract) return undefined
            return erc20Contract.methods.balanceOf(account).call({
                from: account,
                chainId: toHex(token.chainId),
            })
        }
    }
}
