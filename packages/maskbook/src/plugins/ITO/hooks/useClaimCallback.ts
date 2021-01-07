import BigNumber from 'bignumber.js'
import { useCallback } from 'react'
import Web3Utils from 'web3-utils'
import type { Tx } from '../../../contracts/types'
import { addGasMargin, isSameAddress } from '../../../web3/helpers'
import { useAccount } from '../../../web3/hooks/useAccount'
import { TransactionStateType, useTransactionState } from '../../../web3/hooks/useTransactionState'
import type { ERC20TokenDetailed, EtherTokenDetailed } from '../../../web3/types'
import { useITO_Contract } from '../contracts/useITO_Contract'
import { usePoolPayload } from './usePoolPayload'

export function useClaimCallback(
    id: string,
    password: string,
    total: string,
    token: PartialRequired<EtherTokenDetailed | ERC20TokenDetailed, 'address'>,
) {
    const account = useAccount()
    const ITO_Contract = useITO_Contract()

    const poolPayload = usePoolPayload(id)
    const [claimState, setClaimState] = useTransactionState()

    const claimCallback = useCallback(async () => {
        if (!ITO_Contract || !id || !password) {
            setClaimState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        // pre-step: start waiting for provider to confirm tx
        setClaimState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        const config: Tx = {
            from: account,
            to: ITO_Contract.options.address,
        }
        const params: Parameters<typeof ITO_Contract['methods']['claim']> = [
            id,
            password,
            account,
            Web3Utils.sha3(account)!,
            poolPayload.exchange_tokens.findIndex((x) => isSameAddress(x.address, token.address)),
            total,
        ]

        // step 1: estimate gas
        const estimatedGas = await ITO_Contract.methods
            .claim(...params)
            .estimateGas(config)
            .catch((error: Error) => {
                setClaimState({
                    type: TransactionStateType.FAILED,
                    error,
                })
                throw error
            })

        // step 2-1: blocking
        return new Promise<string>((resolve, reject) => {
            const onSucceed = (hash: string) => {
                setClaimState({
                    type: TransactionStateType.HASH,
                    hash,
                })
                resolve(hash)
            }
            const onFailed = (error: Error) => {
                setClaimState({
                    type: TransactionStateType.FAILED,
                    error,
                })
                reject(error)
            }
            ITO_Contract.methods.claim(...params).send(
                {
                    gas: addGasMargin(new BigNumber(estimatedGas)).toFixed(),
                    ...config,
                },
                async (error: Error, hash: string) => {
                    if (hash) onSucceed(hash)
                    else if (error) onFailed(error)
                },
            )
        })
    }, [ITO_Contract, id, password, account, poolPayload, total, token.address])

    const resetCallback = useCallback(() => {
        setClaimState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [claimState, claimCallback, resetCallback] as const
}
