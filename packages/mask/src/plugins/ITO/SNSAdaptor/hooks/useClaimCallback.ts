import { useAccount, useChainId, useWeb3Connection } from '@masknet/plugin-infra/web3'
import { isSameAddress, NetworkPluginID } from '@masknet/web3-shared-base'
import { encodeTransaction, useITOConstants } from '@masknet/web3-shared-evm'
import stringify from 'json-stable-stringify'
import { useAsyncFn } from 'react-use'
import { checkAvailability } from '../utils/checkAvailability'
import { useITO_Contract } from './useITO_Contract'

export function useClaimCallback(pids: string[], contractAddress: string | undefined) {
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM, { chainId })
    const { ITO_CONTRACT_ADDRESS } = useITOConstants(chainId)
    const { contract: ITO_Contract } = useITO_Contract(chainId, contractAddress)

    const isV1 = isSameAddress(ITO_CONTRACT_ADDRESS ?? '', contractAddress)
    return useAsyncFn(async () => {
        if (!ITO_Contract || !contractAddress || pids.length === 0 || !connection) return

        // check if already claimed
        try {
            const availabilityList = await Promise.all(
                pids.map((pid) => checkAvailability(pid, account, contractAddress, chainId, connection, isV1)),
            )
            const isClaimed = availabilityList.some((availability) => availability.claimed)

            if (isClaimed) return
        } catch {
            return
        }

        const config = {
            from: account,
        }
        const tx = await encodeTransaction(ITO_Contract, ITO_Contract.methods.claim(pids), config)
        return connection.sendTransaction(tx)
    }, [account, chainId, ITO_Contract, stringify(pids), isV1, connection])
}
