import { useChainContext, useWeb3Connection } from '@masknet/web3-hooks-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { ContractTransaction, useITOConstants } from '@masknet/web3-shared-evm'
import { checkAvailability } from '../utils/checkAvailability.js'
import { useITO_Contract } from './useITO_Contract.js'
import { useCallback } from 'react'

export function useClaimCallback(contractAddress: string | undefined) {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM, { chainId })
    const { ITO_CONTRACT_ADDRESS } = useITOConstants(chainId)
    const { contract: ITO_Contract } = useITO_Contract(chainId, contractAddress)

    const isV1 = isSameAddress(ITO_CONTRACT_ADDRESS ?? '', contractAddress)
    return useCallback(
        async (pids: string[]) => {
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

            const tx = await new ContractTransaction(ITO_Contract).fillAll(ITO_Contract.methods.claim(pids), {
                from: account,
            })
            return connection.sendTransaction(tx)
        },
        [account, chainId, ITO_Contract, isV1, connection],
    )
}
