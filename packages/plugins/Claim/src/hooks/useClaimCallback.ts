import { useCallback } from 'react'
import { Web3 } from '@masknet/web3-providers'
import { useChainContext } from '@masknet/web3-hooks-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { ContractTransaction, useITOConstants } from '@masknet/web3-shared-evm'
import { checkAvailability } from '../utils/checkAvailability.js'
import { useITO_Contract } from './useITO_Contract.js'

export function useClaimCallback(contractAddress: string | undefined) {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { ITO_CONTRACT_ADDRESS } = useITOConstants(chainId)
    const { contract: ITO_Contract } = useITO_Contract(chainId, contractAddress)

    const isV1 = isSameAddress(ITO_CONTRACT_ADDRESS ?? '', contractAddress)
    return useCallback(
        async (pids: string[]) => {
            if (!ITO_Contract || !contractAddress || pids.length === 0) return

            // check if already claimed
            try {
                const availabilityList = await Promise.all(
                    pids.map((pid) => checkAvailability(pid, account, contractAddress, chainId, isV1)),
                )
                const isClaimed = availabilityList.some((availability) => availability.claimed)

                if (isClaimed) return
            } catch {
                return
            }

            const tx = await new ContractTransaction(ITO_Contract).fillAll(ITO_Contract.methods.claim(pids), {
                from: account,
            })
            return Web3.sendTransaction(tx)
        },
        [account, chainId, ITO_Contract, isV1],
    )
}
