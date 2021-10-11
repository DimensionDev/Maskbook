import { useEffect, useMemo, useState, useCallback } from 'react'
import { useAsyncRetry } from 'react-use'
import { clamp, first } from 'lodash-es'
import BigNumber from 'bignumber.js'
import { createContainer } from 'unstated-next'
import { unreachable } from '@dimensiondev/kit'
import {
    ChainId,
    isSameAddress,
    useERC20TokenBalance,
    useNativeTokenBalance,
    useTokenConstants,
    useFungibleTokensDetailed,
    EthereumTokenType,
    useChainId,
    useAccount,
    useERC721ContractDetailed,
} from '@masknet/web3-shared'
import { BoxInfo, BoxState } from '../type'
import { useMaskBoxInfo } from './useMaskBoxInfo'
import { useMaskBoxCreationSuccessEvent } from './useMaskBoxCreationSuccessEvent'
import { useMaskBoxTokensForSale } from './useMaskBoxTokensForSale'
import { useMaskBoxPurchasedTokens } from './useMaskBoxPurchasedTokens'
import { useHeartBit } from './useHeartBit'
import { formatCountdown } from '../helpers/formatCountdown'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

function useContext(initialState?: { boxId: string }) {
    const heartBit = useHeartBit()

    const account = useAccount()
    const chainId = useChainId()
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants(ChainId.Mainnet)

    const [boxId, setBoxId] = useState(initialState?.boxId ?? '')
    const [paymentTokenAddress, setPaymentTokenAddress] = useState('')

    //#region the box info
    const { value: maskBoxInfo = null, retry: retryMaskBoxInfo } = useMaskBoxInfo(boxId)
    const { value: maskBoxCreationSuccessEvent = null, retry: retryMaskBoxCreationSuccessEvent } =
        useMaskBoxCreationSuccessEvent(maskBoxInfo?.creator ?? '', maskBoxInfo?.nft_address ?? '', boxId)
    const { value: paymentTokens = [] } = useFungibleTokensDetailed(
        maskBoxInfo?.payment?.map(([address]) => {
            return {
                type: isSameAddress(address, ZERO_ADDRESS) ? EthereumTokenType.Native : EthereumTokenType.ERC20,
                address,
            }
        }) ?? [],
        chainId,
    )
    const { value: allTokens = [], retry: retryMaskBoxTokensForSale } = useMaskBoxTokensForSale(boxId)
    const { value: purchasedTokens = [], retry: retryMaskBoxPurchasedTokens } = useMaskBoxPurchasedTokens(
        boxId,
        account,
    )

    const boxInfo = useAsyncRetry<BoxInfo | null>(async () => {
        if (!maskBoxInfo || !maskBoxCreationSuccessEvent) return null
        const personalLimit = Number.parseInt(maskBoxInfo.personal_limit, 10)
        const info: BoxInfo = {
            boxId,
            creator: maskBoxInfo.creator,
            name: maskBoxInfo.name,
            sellAll: maskBoxCreationSuccessEvent.returnValues.sell_all,
            personalLimit: personalLimit,
            personalRemaining: Math.max(0, personalLimit - purchasedTokens.length),
            remaining: Number.parseInt(maskBoxInfo.remaining, 10),
            startAt: new Date(Number.parseInt(maskBoxCreationSuccessEvent.returnValues.start_time, 10) * 1000),
            endAt: new Date(Number.parseInt(maskBoxCreationSuccessEvent.returnValues.end_time, 10) * 1000),
            total: maskBoxInfo.total,
            tokenIds: allTokens,
            tokenIdsPurchased: purchasedTokens,
            payments: paymentTokens.map((token, i) => {
                return {
                    token: token,
                    price: maskBoxInfo.payment[i][1],
                    receivableAmount: maskBoxInfo.payment[i][2],
                }
            }),
            tokenAddress: maskBoxInfo.nft_address,
            heroImageURL:
                'https://lh3.googleusercontent.com/J734DD96jgdCHK95vKF1lb1sGn2qyxRIo2wF7pDYN3rEoQqZSBTHH2tRecaxgFCux-oIZcJAZSsVYY9xaGhSIZwpkQlh3R6YHf8w=w600',
            qualificationAddress: maskBoxInfo.qualification,
        }
        return Promise.resolve(info)
    }, [
        allTokens.join(),
        purchasedTokens.join(),
        paymentTokens?.map((x) => x.address).join(),
        maskBoxInfo,
        maskBoxCreationSuccessEvent,
    ])

    const boxState = useMemo(() => {
        const { value: info, loading, error } = boxInfo
        if (loading) return BoxState.UNKNOWN
        if (error || !info) return BoxState.ERROR
        const now = new Date()
        if (new BigNumber(info.tokenIdsPurchased.length).isGreaterThanOrEqualTo(info.personalLimit))
            return BoxState.DRAWED_OUT
        if (new BigNumber(info.remaining).isLessThanOrEqualTo(0)) return BoxState.SOLD_OUT
        if (info.startAt > now) return BoxState.NOT_READY
        if (info.endAt < now || maskBoxInfo?.expired) return BoxState.EXPIRED
        return BoxState.READY
    }, [boxInfo, maskBoxInfo, heartBit])

    const boxStateMessage = useMemo(() => {
        switch (boxState) {
            case BoxState.UNKNOWN:
                return 'Loading...'
            case BoxState.READY:
                return 'Draw'
            case BoxState.EXPIRED:
                return 'Ended'
            case BoxState.NOT_READY:
                const now = Date.now()
                const startAt = boxInfo?.value?.startAt.getTime() ?? 0
                if (startAt <= now) return 'Loading...'
                const countdown = formatCountdown(startAt - now)
                return countdown ? `Start sale in ${countdown}` : 'Loading...'
            case BoxState.SOLD_OUT:
                return 'Sold Out'
            case BoxState.DRAWED_OUT:
                return 'Drawed Out'
            case BoxState.ERROR:
                return 'Failed to load box info.'
            default:
                unreachable(boxState)
        }
    }, [boxState, heartBit])
    //#endregion

    //#region the erc721 contract detailed
    const { value: contractDetailed } = useERC721ContractDetailed(maskBoxInfo?.nft_address)
    //#endregion

    //#region the payment count
    const [paymentCount, setPaymentCount] = useState(1)
    const setPaymentCount_ = useCallback(
        (count: number) => {
            setPaymentCount(clamp(count || 1, 1, boxInfo.value?.personalRemaining ?? 1))
        },
        [boxInfo.value?.personalRemaining],
    )
    //#endregion

    //#region the payment token
    const { value: paymentNativeTokenBalance = '0' } = useNativeTokenBalance()
    const { value: paymentERC20TokenBalance = '0' } = useERC20TokenBalance(
        isSameAddress(paymentTokenAddress, NATIVE_TOKEN_ADDRESS) ? '' : paymentTokenAddress,
    )
    const paymentTokenInfo = boxInfo.value?.payments.find((x) => isSameAddress(x.token.address, paymentTokenAddress))

    useEffect(() => {
        const firstPaymentTokenAddress = first(boxInfo.value?.payments)?.token.address
        if (paymentTokenAddress === '' && firstPaymentTokenAddress) setPaymentTokenAddress(firstPaymentTokenAddress)
    }, [paymentTokenAddress, boxInfo.value?.payments.map((x) => x.token.address).join()])
    //#endregion

    console.log({
        allTokens,
        purchasedTokens,
        maskBoxInfo,
        maskBoxCreationSuccessEvent,
        boxInfo,
        boxState,
        paymentNativeTokenBalance,
        paymentERC20TokenBalance,
    })

    return {
        // box id
        boxId,
        setBoxId,

        // box info
        boxInfo,

        // box state
        boxState,
        boxStateMessage,

        // erc721 contract detailed
        contractDetailed,

        // payment count
        paymentCount,
        setPaymentCount: setPaymentCount_,

        // payment address
        paymentTokenAddress: paymentTokenAddress || (first(boxInfo.value?.payments)?.token.address ?? ''),
        setPaymentTokenAddress: (address: string) => {
            if (boxInfo.value?.payments.some((x) => isSameAddress(x.token.address ?? '', address)))
                setPaymentTokenAddress(address)
        },

        // payment token
        paymentTokenPrice: paymentTokenInfo?.price ?? '0',
        paymentTokenIndex:
            boxInfo.value?.payments.findIndex((x) => isSameAddress(x.token.address ?? '', paymentTokenAddress)) ?? -1,
        paymentTokenBalance: isSameAddress(paymentTokenAddress, NATIVE_TOKEN_ADDRESS)
            ? paymentNativeTokenBalance
            : paymentERC20TokenBalance,
        paymentTokenDetailed: paymentTokenInfo?.token ?? null,

        // callbacks
        retryMaskBoxInfo,
        retryMaskBoxCreationSuccessEvent,
        retryMaskBoxTokensForSale,
        retryMaskBoxPurchasedTokens,
    }
}

export const Context = createContainer(useContext)
