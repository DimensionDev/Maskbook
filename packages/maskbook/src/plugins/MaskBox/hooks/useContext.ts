import { first } from 'lodash-es'
import {
    ChainId,
    isSameAddress,
    useERC20TokenBalance,
    useNativeTokenBalance,
    useNativeTokenDetailed,
    useERC20TokenDetailed,
    useTokenConstants,
} from '@masknet/web3-shared'
import BigNumber from 'bignumber.js'
import { useMemo, useState } from 'react'
import { useAsyncRetry } from 'react-use'
import { createContainer } from 'unstated-next'
import { BoxInfo, BoxState } from '../type'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

function useContext(initialState?: { boxId: string }) {
    const now = new Date()
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants(ChainId.Mainnet)

    const [boxId, setBoxId] = useState(initialState?.boxId ?? '')
    const [paymentTokenAddress, setPaymentTokenAddress] = useState('')

    //#region the payment token balance
    const paymentNativeTokenBalance = useNativeTokenBalance()
    const paymentERC20TokenBalance = useERC20TokenBalance(
        isSameAddress(paymentTokenAddress, NATIVE_TOKEN_ADDRESS) ? '' : paymentTokenAddress,
    )
    //#endregion

    //#region the payment token detailed
    const paymentNativeTokenDetailed = useNativeTokenDetailed()
    const paymentERC20TokenDetailed = useERC20TokenDetailed(
        isSameAddress(paymentTokenAddress, NATIVE_TOKEN_ADDRESS) ? '' : paymentTokenAddress,
    )
    //#endregion

    const boxInfoResult = useAsyncRetry<BoxInfo>(async () => {
        const info: BoxInfo = {
            boxId,
            creator: '',
            name: 'Big Fat Sexy Mystery Box.',
            sellAll: false,
            personalLimit: 5,
            remaining: '10',
            total: '100',
            startAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
            endAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
            tokenIds: [],
            tokenIdsPurchased: [],
            payments: [
                {
                    price: '10',
                    receivableAmount: '10',
                    tokenAddress: ZERO_ADDRESS,
                },
            ],
            tokenAddress: '',
            heroImageURL:
                'https://lh3.googleusercontent.com/J734DD96jgdCHK95vKF1lb1sGn2qyxRIo2wF7pDYN3rEoQqZSBTHH2tRecaxgFCux-oIZcJAZSsVYY9xaGhSIZwpkQlh3R6YHf8w=w600',
            qualificationAddress: ZERO_ADDRESS,
        }
        if (paymentTokenAddress === '') setPaymentTokenAddress(first(info.payments)?.tokenAddress ?? '')
        return Promise.resolve(info)
    }, [boxId])

    const boxState = useMemo(() => {
        if (boxInfoResult.error) return BoxState.ERROR
        const { value: info, loading } = boxInfoResult
        if (loading) return BoxState.UNKNOWN
        if (!info) return BoxState.ERROR
        const now = new Date()
        if (new BigNumber(info.tokenIdsPurchased.length).isGreaterThanOrEqualTo(info.personalLimit))
            return BoxState.DRAWED_OUT
        if (new BigNumber(info.remaining).isLessThanOrEqualTo(0)) return BoxState.SOLD_OUT
        if (info.startAt > now) return BoxState.NOT_READY
        if (info.endAt < now) return BoxState.EXPIRED
        return BoxState.READY
    }, [boxInfoResult])

    return {
        boxId,
        setBoxId,

        paymentTokenAmount: '10000',
        paymentTokenAddress,
        setPaymentTokenAddress: (address: string) => {
            if (boxInfoResult.value?.payments.some((x) => isSameAddress(x.tokenAddress, address)))
                setPaymentTokenAddress(address)
        },

        paymentTokenBalance: isSameAddress(paymentTokenAddress, NATIVE_TOKEN_ADDRESS)
            ? paymentNativeTokenBalance
            : paymentERC20TokenBalance,
        paymentTokenDetailed: isSameAddress(paymentTokenAddress, NATIVE_TOKEN_ADDRESS)
            ? paymentNativeTokenDetailed
            : paymentERC20TokenDetailed,

        boxState,

        boxInfoResult,
    }
}

export const Context = createContainer(useContext)
