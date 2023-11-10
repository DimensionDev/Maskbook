import { useAsync } from 'react-use'
import * as web3_utils from /* webpackDefer: true */ 'web3-utils'
import { EVMContract } from '@masknet/web3-providers'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { TokenType } from '@masknet/web3-shared-base'
import { isNativeTokenAddress } from '@masknet/web3-shared-evm'
import { useTip } from '../../contexts/index.js'

const MIN_GAS_LIMIT = 21000
const DEFAULT_GAS_LIMIT = 50000

// We only care about fungible tokens
export function useGasLimit(fallback = DEFAULT_GAS_LIMIT) {
    const { tipType, token, amount, recipientAddress } = useTip()
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    return useAsync(async () => {
        const isNativeToken = isNativeTokenAddress(token?.address)
        const isTippingToken = tipType === TokenType.Fungible
        if (isNativeToken || !isTippingToken) return MIN_GAS_LIMIT
        if (!token?.address) return fallback

        const contract = EVMContract.getERC20Contract(token.address, {
            chainId,
            account,
        })
        const tx = contract?.methods.transfer(recipientAddress, web3_utils.toHex(amount))
        const estimated = await tx?.estimateGas({
            from: account,
        })
        return estimated ?? fallback
    }, [token, tipType, chainId, account, fallback])
}
