import BigNumber from 'bignumber.js'
import stringify from 'json-stable-stringify'
import { omit, pick } from 'lodash-es'
import { useCallback, useMemo, useState } from 'react'
import type { TransactionConfig } from 'web3-core'
import Services, { ServicesWithProgress } from '../../../../extension/service'
import { StageType } from '../../../../utils/promiEvent'
import { addGasMargin } from '../../../../web3/helpers'
import { useAccount } from '../../../../web3/hooks/useAccount'
import { useChainId } from '../../../../web3/hooks/useChainState'
import { TransactionState, TransactionStateType } from '../../../../web3/hooks/useTransactionState'
import { ChainId } from '../../../../web3/types'
import type { SwapQuoteResponse, TradeComputed } from '../../types'

export function useTradeCallback(tradeComputed: TradeComputed<SwapQuoteResponse> | null) {
    const account = useAccount()
    const chainId = useChainId()
    const [tradeState, setTradeState] = useState<TransactionState>({
        type: TransactionStateType.UNKNOWN,
    })

    // compose transaction config
    const config = useMemo(() => {
        if (!account || !tradeComputed?.trade_ || chainId !== ChainId.Mainnet) return null
        return {
            from: account,
            ...pick(tradeComputed.trade_, ['to', 'data', 'value', 'gas']),
        } as TransactionConfig
    }, [account, tradeComputed])

    const tradeCallback = useCallback(async () => {
        // validate config
        if (!account || !config) {
            setTradeState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        // pre-step: start waiting for provider to confirm tx
        setTradeState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        try {
            // step 1: estimate tx
            const gasEstimated = await Services.Ethereum.estimateGas(omit(config, ['gas']), chainId)
            const config_ = {
                ...config,
                gas: addGasMargin(new BigNumber(gasEstimated)).toFixed(),
            }

            // step 2: send tx
            for await (const stage of ServicesWithProgress.sendTransaction(account, config_)) {
                switch (stage.type) {
                    case StageType.TRANSACTION_HASH:
                        setTradeState({
                            type: TransactionStateType.HASH,
                            hash: stage.hash,
                        })
                        break
                    case StageType.RECEIPT:
                        setTradeState({
                            type: TransactionStateType.HASH,
                            hash: stage.receipt.transactionHash,
                        })
                        break
                    case StageType.CONFIRMATION:
                        setTradeState({
                            type: TransactionStateType.HASH,
                            hash: stage.receipt.transactionHash,
                        })
                        break
                    default:
                        return
                }
            }
        } catch (error) {
            setTradeState({
                type: TransactionStateType.FAILED,
                error,
            })
        }
    }, [account, chainId, stringify(config)])

    const resetCallback = useCallback(() => {
        setTradeState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [tradeState, tradeCallback, resetCallback] as const
}
