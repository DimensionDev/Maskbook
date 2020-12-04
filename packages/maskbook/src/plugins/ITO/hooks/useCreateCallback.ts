import { useCallback, useState } from 'react'
import { useAccount } from '../../../web3/hooks/useAccount'
import { TransactionStateType, useTransactionState } from '../../../web3/hooks/useTransactionState'
import { ERC20TokenDetailed, EtherTokenDetailed } from '../../../web3/types'
import { useITO_Contract } from '../contracts/useITO_Contract'

export interface ITOSettings {
    password: string
    name: string
    duration: number
    token?: EtherTokenDetailed | ERC20TokenDetailed
    amount: string
    message: string
    total: number
    beginTime: string
    endTime: string
    rations: string[]
    exchanges: (EtherTokenDetailed | ERC20TokenDetailed)[]
}

export function useCreateCallback(itoSettings: ITOSettings) {
    const account = useAccount()
    const [createState, setCreateState] = useTransactionState()
    const itoContract = useITO_Contract()
    const [createSettings, setCreateSettings] = useState<ITOSettings | null>(null)

    const createCallback = useCallback(async () => {
        const {
            password,
            name,
            duraction,
            token,
            amount,
            message,
            total,
            beginTime,
            endTime,
            rations,
            exchanges,
        } = itoSettings

        console.log('--------itoseetting-------')
        console.log(itoSettings)
        console.log('---------end---------')
        //:debug
        setCreateSettings(itoSettings)
        /*
        if (!token || !itoContract) {
            setCreateState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        if (new BigNumber(amount).isLessThan(0)) {
            setCreateState({
                type: TransactionStateType.FAILED,
                error: new Error('At least 1 person should be exchange'),
            })
            return
        }

        if (exchanges.length === 0 || rations.length === 0) {
            setCreateState({
                type: TransactionStateType.FAILED,
                error: new Error('Set an least one exchange token and exchange rate'),
            })
            return
        }

        if (token.type !== EthereumTokenType.Ether && token.type !== EthereumTokenType.ERC20) {
            setCreateState({
                type: TransactionStateType.FAILED,
                error: new Error('Token not supported'),
            })
            return
        }

        if (total <= 0) {
            setCreateState({
                type: TransactionStateType.FAILED,
                error: new Error('At least 1 ETH for per wallet'),
            })
            return
        }

        setCreateState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        const seed = Math.random().toString()
        const config: Tx = {
            form: account,
            to: itoContract.options.address,
            value: new BigNumber(token.type === EthereumTokenType.Ether ? amount : '0').toFixed(),
        }
        */
    }, [account, itoContract, itoSettings])

    const resetCallback = useCallback(() => {
        setCreateState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [createSettings, createState, createCallback, resetCallback]
}
