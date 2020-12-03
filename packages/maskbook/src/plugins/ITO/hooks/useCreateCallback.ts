import { useCallback, useState } from 'react'
import BigNumber from 'bignumber.js'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useTransactionState } from '../../../web3/hooks/useTransactionState'
export interface ITOSettings {
    pasword: string
    duration: number
    name: string
    fromtoken?: EtherTokenDetailed | ERC20TokenDetailed
    totoken?: EtherTokenDetailed | ERC20TokenDetailed
    message: string
    enddate: string
    amount: string
    total: string
    ratio: number
}

export function useCreateCallback(itoSettings: ITOSettings) {
    const account = useAccount()
    /*
	const itoContract = useITOContract()
*/
    const [createState, setCreateState] = useTransactionState()

    const [createSettings, setCreateSettings] = useState<ITOSettings | null>(null)

    const createCallback = useCallback(async () => {
        const { password, duration, name, fromtoken, totoken, message, enddate, amount, total, ratio } = itoSettings

        if (!fromtoken /*|| !itoContract*/) {
            setCreateState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        if (fromtoken.type !== EthereumTokenType.Ether && fromtoken.type !== EthereumTokenType.ERC20) {
            setCreateState({
                type: TransactionStateType.FAILED,
                error: Error('Token not support'),
            })
            return
        }

        if (new BigNumber(amount).islessThan(ratio)) {
            setCreateState({
                type: TransactionStateType.FAILED,
                error: new Error('At least [number of wallat] token to swap ratio'),
            })
            return
        }

        if (ratio <= 0) {
            setCreateState({
                type: TransactionStateType.FAILED,
                error: new Error('ratis is zero'),
            })
            return
        }

        const ethnum = new BigNumber(amount).dividedBy(ratio)
        if (new BigNumber(ethnum).isLessThan(total)) {
            setCreateState({
                type: TransactionStateType.FAILED,
                error: new Error('less'),
            })
            return
        }

        setCreateState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        const seed = Math.random.toString()
    }, [account, /* itoContract, */ itoSettings])

    const resetCallback = useCallback(() => {
        setCreateState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [createSettings, createState, createCallback, resetCallback] as const
}
