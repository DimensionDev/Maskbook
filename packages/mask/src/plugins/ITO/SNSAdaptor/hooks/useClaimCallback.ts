import { useAsyncFn } from 'react-use'
import stringify from 'json-stable-stringify'
import { useChainContext, useWeb3, useWeb3Connection } from '@masknet/web3-hooks-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { ContractTransaction, decodeEvents, useITOConstants } from '@masknet/web3-shared-evm'
import { checkAvailability } from '../utils/checkAvailability.js'
import { useITO_Contract } from './useITO_Contract.js'

export function useClaimCallback(pids: string[], contractAddress: string | undefined) {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM, { chainId })
    const { ITO_CONTRACT_ADDRESS } = useITOConstants(chainId)
    const web3 = useWeb3(NetworkPluginID.PLUGIN_EVM)
    const { contract: ITO_Contract } = useITO_Contract(chainId, contractAddress)

    const isV1 = isSameAddress(ITO_CONTRACT_ADDRESS ?? '', contractAddress)
    return useAsyncFn(async () => {
        if (!ITO_Contract || !contractAddress || pids.length === 0 || !connection || !web3) return

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
        const hash = await connection.sendTransaction(tx)
        const receipt = await connection.getTransactionReceipt(hash)
        if (receipt) {
            const events = decodeEvents(web3, ITO_Contract.options.jsonInterface, receipt)
            return {
                hash,
                receipt,
                events,
            }
        }
        return { hash, receipt }
    }, [account, chainId, ITO_Contract, stringify(pids), isV1, connection])
}
