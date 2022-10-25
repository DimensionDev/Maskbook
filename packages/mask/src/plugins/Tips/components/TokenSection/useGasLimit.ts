import { useAsync } from 'react-use'
import { useChainContext, useWeb3State } from '@masknet/web3-hooks-base'
import ERC20ABI from '@masknet/web3-contracts/abis/ERC20.json'
import { NetworkPluginID } from '@masknet/shared-base'
import type { ERC20 } from '@masknet/web3-contracts/types/ERC20'
import { createContract, isNativeTokenAddress } from '@masknet/web3-shared-evm'
import { AbiItem, toHex } from 'web3-utils'
import { useTip } from '../../contexts'
import { TipsType } from '../../types'

const MIN_GAS_LIMIT = 21000
// We only care about fungible tokens
export function useGasLimit(fallback = 50000) {
    const { Connection } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const { tipType, token, amount, recipientAddress } = useTip()
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    return useAsync(async () => {
        const isNativeToken = isNativeTokenAddress(token?.address)
        const isTippingToken = tipType === TipsType.Tokens
        if (isNativeToken || !isTippingToken) {
            return MIN_GAS_LIMIT
        }
        const connection = await Connection?.getConnection?.({
            chainId,
            account,
        })
        if (!connection || !token?.address) return fallback
        const web3 = await connection.getWeb3({
            chainId,
            account,
        })

        const contract = createContract<ERC20>(web3, token.address, ERC20ABI as AbiItem[])
        const tx = contract?.methods.transfer(recipientAddress, toHex(amount))
        const estimated = await tx?.estimateGas({
            from: account,
        })
        return estimated ?? fallback
    }, [Connection, token, tipType, chainId, account, fallback])
}
