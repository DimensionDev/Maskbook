import BigNumber from 'bignumber.js'
import { useCallback } from 'react'
import Web3Utils from 'web3-utils'
import type { TransactionReceipt } from 'web3-core'
import type { Tx } from '../../../contracts/types'
import { buf2hex, hex2buf } from '../../../utils/utils'
import { addGasMargin, isSameAddress } from '../../../web3/helpers'
import { useAccount } from '../../../web3/hooks/useAccount'
import { TransactionStateType, useTransactionState } from '../../../web3/hooks/useTransactionState'
import { ERC20TokenDetailed, EtherTokenDetailed, EthereumTokenType, TransactionEventType } from '../../../web3/types'
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

    const { value: payload } = usePoolPayload(id)
    const [claimState, setClaimState] = useTransactionState()
    const claimCallback = useCallback(async () => {
        if (!ITO_Contract || !payload || !id || !password) {
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
            value: new BigNumber(token.type === EthereumTokenType.Ether ? total : '0').toFixed(),
        }

        // error: invalid claim amount
        if (!new BigNumber(total).isPositive()) {
            setClaimState({
                type: TransactionStateType.FAILED,
                error: new Error('Invalid claim amount'),
            })
            return
        }

        // error: invalid token
        const claimTokenAt = payload.exchange_tokens.findIndex((x) => isSameAddress(x.address, token.address))
        if (claimTokenAt === -1) {
            setClaimState({
                type: TransactionStateType.FAILED,
                error: new Error(`Unknown ${token.symbol} token`),
            })
            return
        }

        const params: Parameters<typeof ITO_Contract['methods']['claim']> = [
            id,
            Web3Utils.soliditySha3(
                Web3Utils.hexToNumber(`0x${buf2hex(hex2buf(Web3Utils.sha3(password) ?? '').slice(0, 6))}`),
                account,
            )!,
            account,
            Web3Utils.sha3(account)!,
            claimTokenAt,
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
        return new Promise<void>((resolve, reject) => {
            const onSucceed = (no: number, receipt: TransactionReceipt) => {
                setClaimState({
                    type: TransactionStateType.CONFIRMED,
                    no,
                    receipt,
                })
                resolve()
            }
            const onFailed = (error: Error) => {
                setClaimState({
                    type: TransactionStateType.FAILED,
                    error,
                })
                reject(error)
            }
            const promiEvent = ITO_Contract.methods.claim(...params).send({
                gas: addGasMargin(new BigNumber(estimatedGas)).toFixed(),
                ...config,
            })

            promiEvent.on(TransactionEventType.ERROR, onFailed)
            promiEvent.on(TransactionEventType.CONFIRMATION, onSucceed)
            promiEvent.on(TransactionEventType.RECEIPT, (receipt: TransactionReceipt) => onSucceed(0, receipt))
        })
    }, [ITO_Contract, id, password, account, payload, total, token.address])

    const resetCallback = useCallback(() => {
        setClaimState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [claimState, claimCallback, resetCallback] as const
}
