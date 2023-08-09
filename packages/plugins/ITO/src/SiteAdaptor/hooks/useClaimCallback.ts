import { useAsyncFn } from 'react-use'
import stringify from 'json-stable-stringify'
import { useChainContext } from '@masknet/web3-hooks-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { ContractTransaction, decodeEvents, useITOConstants } from '@masknet/web3-shared-evm'
import { Web3 } from '@masknet/web3-providers'
import { checkAvailability } from '../utils/checkAvailability.js'
import { useITO_Contract } from './useITO_Contract.js'

export function useClaimCallback(pids: string[], contractAddress: string | undefined) {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { ITO_CONTRACT_ADDRESS } = useITOConstants(chainId)
    const { contract: ITO_Contract } = useITO_Contract(chainId, contractAddress)

    const isV1 = isSameAddress(ITO_CONTRACT_ADDRESS ?? '', contractAddress)
    return useAsyncFn(async () => {
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
        const hash = await Web3.sendTransaction(tx, {
            chainId,
        })
        const receipt = await Web3.getTransactionReceipt(hash, {
            chainId,
        })
        if (receipt) {
            return {
                hash,
                receipt,
                events: decodeEvents(ITO_Contract.options.jsonInterface, receipt),
            }
        }
        return { hash, receipt }
    }, [account, chainId, ITO_Contract, stringify(pids), isV1])
}
