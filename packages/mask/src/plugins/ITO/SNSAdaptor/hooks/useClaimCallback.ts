import type { NonPayableTx } from '@masknet/web3-contracts/types/types'
import { isSameAddress, TransactionEventType, useAccount, useChainId, useITOConstants } from '@masknet/web3-shared-evm'
import stringify from 'json-stable-stringify'
import { useAsyncFn } from 'react-use'
import { checkAvailability } from '../../Worker/apis/checkAvailability'
import { useITO_Contract } from './useITO_Contract'

export function useClaimCallback(pids: string[], contractAddress: string | undefined) {
    const account = useAccount()
    const chainId = useChainId()
    const { ITO_CONTRACT_ADDRESS } = useITOConstants()
    const { contract: ITO_Contract } = useITO_Contract(contractAddress)

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

        // estimate gas and compose transaction
        const config = {
            from: account,
            gas: await ITO_Contract.methods.claim(pids).estimateGas({ from: account }),
        }

        // send transaction and wait for hash
        return new Promise<string>(async (resolve, reject) => {
            ITO_Contract.methods
                .claim(pids)
                .send(config as NonPayableTx)
                .on(TransactionEventType.CONFIRMATION, (_, receipt) => {
                    resolve(receipt.transactionHash)
                })
                .on(TransactionEventType.ERROR, (error) => {
                    reject(error)
                })
        })
    }, [account, chainId, ITO_Contract, stringify(pids), isV1])
}
