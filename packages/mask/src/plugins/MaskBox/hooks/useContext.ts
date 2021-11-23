import { useEffect, useMemo, useState, useCallback } from 'react'
import { useAsyncRetry } from 'react-use'
import { omit, clamp, first, uniq } from 'lodash-unified'
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
    addGasMargin,
} from '@masknet/web3-shared-evm'
import type { NonPayableTx } from '@masknet/web3-contracts/types/types'
import { BoxInfo, BoxState } from '../type'
import { useMaskBoxInfo } from './useMaskBoxInfo'
import { useMaskBoxCreationSuccessEvent } from './useMaskBoxCreationSuccessEvent'
import { useMaskBoxTokensForSale } from './useMaskBoxTokensForSale'
import { useMaskBoxPurchasedTokens } from './useMaskBoxPurchasedTokens'
import { formatCountdown } from '../helpers/formatCountdown'
import { useOpenBoxTransaction } from './useOpenBoxTransaction'
import { useMaskBoxMetadata } from './useMaskBoxMetadata'
import { useHeartBit } from './useHeartBit'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

function useContext(initialState?: { boxId: string }) {
    const heartBit = useHeartBit()
    const account = useAccount()
    const chainId = useChainId()
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants(ChainId.Mainnet)

    const [boxId, setBoxId] = useState(initialState?.boxId ?? '')
    const [paymentTokenAddress, setPaymentTokenAddress] = useState('')

    //#region the box info
    const {
        value: maskBoxInfo = null,
        error: errorMaskBoxInfo,
        loading: loadingMaskBoxInfo,
        retry: retryMaskBoxInfo,
    } = useMaskBoxInfo(boxId)
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

    const {
        value: boxInfo = null,
        error: errorBoxInfo,
        loading: loadingBoxInfo,
        retry: retryBoxInfo,
    } = useAsyncRetry<BoxInfo | null>(async () => {
        if (
            !maskBoxInfo ||
            isSameAddress(maskBoxInfo?.creator ?? ZERO_ADDRESS, ZERO_ADDRESS) ||
            !maskBoxCreationSuccessEvent
        )
            return null
        const personalLimit = Number.parseInt(maskBoxInfo.personal_limit, 10)
        const remaining = Number.parseInt(maskBoxInfo.remaining, 10)
        const sold = Number.parseInt(maskBoxInfo.total, 10) - remaining
        const info: BoxInfo = {
            boxId,
            creator: maskBoxInfo.creator,
            name: maskBoxInfo.name,
            sellAll: maskBoxCreationSuccessEvent.returnValues.sell_all,
            personalLimit: personalLimit,
            personalRemaining: Math.max(0, personalLimit - purchasedTokens.length),
            remaining,
            startAt: new Date(Number.parseInt(maskBoxCreationSuccessEvent.returnValues.start_time, 10) * 1000),
            endAt: new Date(Number.parseInt(maskBoxCreationSuccessEvent.returnValues.end_time, 10) * 1000),
            total: maskBoxInfo.total,
            sold,
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
            heroImageURL: '',
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
        if (errorMaskBoxInfo || errorBoxInfo) return BoxState.ERROR
        if (loadingMaskBoxInfo || loadingBoxInfo) return BoxState.UNKNOWN
        if (maskBoxInfo && !boxInfo) return BoxState.UNKNOWN
        if (!maskBoxInfo || !boxInfo) return BoxState.NOT_FOUND
        const now = new Date()
        if (new BigNumber(boxInfo.tokenIdsPurchased.length).isGreaterThanOrEqualTo(boxInfo.personalLimit))
            return BoxState.DRAWED_OUT
        if (new BigNumber(boxInfo.remaining).isLessThanOrEqualTo(0)) return BoxState.SOLD_OUT
        if (boxInfo.startAt > now) return BoxState.NOT_READY
        if (boxInfo.endAt < now || maskBoxInfo?.expired) return BoxState.EXPIRED
        return BoxState.READY
    }, [boxInfo, loadingBoxInfo, errorBoxInfo, maskBoxInfo, loadingMaskBoxInfo, errorMaskBoxInfo, heartBit])

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
                const startAt = boxInfo?.startAt.getTime() ?? 0
                if (startAt <= now) return 'Loading...'
                const countdown = formatCountdown(startAt - now)
                return countdown ? `Start sale in ${countdown}` : 'Loading...'
            case BoxState.SOLD_OUT:
                return 'Sold Out'
            case BoxState.DRAWED_OUT:
                return 'Drawed Out'
            case BoxState.ERROR:
                return 'Something went wrong.'
            case BoxState.NOT_FOUND:
                return 'Failed to load box info.'
            default:
                unreachable(boxState)
        }
    }, [boxState, heartBit])
    //#endregion

    //#region the box metadata
    const { value: boxMetadata, retry: retryBoxMetadata } = useMaskBoxMetadata(boxId, boxInfo?.creator ?? '')
    //#endregion

    //#region the erc721 contract detailed
    const { value: contractDetailed } = useERC721ContractDetailed(maskBoxInfo?.nft_address)
    //#endregion

    //#region the payment count
    const [paymentCount, setPaymentCount] = useState(1)
    const setPaymentCount_ = useCallback(
        (count: number) => {
            setPaymentCount(clamp(count || 1, 1, boxInfo?.personalRemaining ?? 1))
        },
        [boxInfo?.personalRemaining],
    )
    //#endregion

    //#region token ids
    const [lastAllTokenIds, setLastAllTokenIds] = useState<string[]>([])
    const [lastPurchasedTokenIds, setLastPurchasedTokenIds] = useState<string[]>([])
    const refreshLastPurchasedTokenIds = useCallback(() => {
        setLastPurchasedTokenIds((tokenIds) => uniq([...tokenIds, ...purchasedTokens]))
    }, [purchasedTokens.length])
    //#endregion

    //#region the payment token
    const { value: paymentNativeTokenBalance = '0' } = useNativeTokenBalance()
    const { value: paymentERC20TokenBalance = '0' } = useERC20TokenBalance(
        isSameAddress(paymentTokenAddress, NATIVE_TOKEN_ADDRESS) ? '' : paymentTokenAddress,
    )
    const paymentTokenInfo = boxInfo?.payments.find((x) => isSameAddress(x.token.address, paymentTokenAddress))
    const paymentTokenIndex =
        boxInfo?.payments.findIndex((x) => isSameAddress(x.token.address ?? '', paymentTokenAddress)) ?? -1
    const paymentTokenPrice = paymentTokenInfo?.price ?? '0'
    const paymentTokenBalance = isSameAddress(paymentTokenAddress, NATIVE_TOKEN_ADDRESS)
        ? paymentNativeTokenBalance
        : paymentERC20TokenBalance
    const paymentTokenDetailed = paymentTokenInfo?.token ?? null
    const isBalanceInsufficient = new BigNumber(paymentTokenPrice).multipliedBy(paymentCount).gt(paymentTokenBalance)

    useEffect(() => {
        const firstPaymentTokenAddress = first(boxInfo?.payments)?.token.address
        if (paymentTokenAddress === '' && firstPaymentTokenAddress) setPaymentTokenAddress(firstPaymentTokenAddress)
    }, [paymentTokenAddress, boxInfo?.payments.map((x) => x.token.address).join()])
    //#endregion

    //#region transactions
    const [openBoxTransactionOverrides, setOpenBoxTransactionOverrides] = useState<NonPayableTx | null>(null)
    const openBoxTransaction = useOpenBoxTransaction(
        boxId,
        paymentCount,
        paymentTokenIndex,
        paymentTokenPrice,
        paymentTokenDetailed,
        openBoxTransactionOverrides,
    )
    const { value: openBoxTransactionGasLimit = 0 } = useAsyncRetry(async () => {
        if (!openBoxTransaction) return 0
        const estimatedGas = await openBoxTransaction.method.estimateGas(omit(openBoxTransaction.config, 'gas'))
        return addGasMargin(estimatedGas).toNumber()
    }, [openBoxTransaction])
    //#endregion

    return {
        // box id
        boxId,
        setBoxId,

        // box info & metadata
        boxInfo,
        boxMetadata,

        // box state
        boxState,
        boxStateMessage,

        // erc721 contract detailed
        contractDetailed,

        // payment count
        paymentCount,
        setPaymentCount: setPaymentCount_,

        // payment address
        paymentTokenAddress: paymentTokenAddress || (first(boxInfo?.payments)?.token.address ?? ''),
        setPaymentTokenAddress: (address: string) => {
            if (boxInfo?.payments.some((x) => isSameAddress(x.token.address ?? '', address)))
                setPaymentTokenAddress(address)
        },

        // token ids
        lastAllTokenIds,
        setLastAllTokenIds,
        lastPurchasedTokenIds,
        setLastPurchasedTokenIds,
        refreshLastPurchasedTokenIds,

        // payment token
        paymentTokenPrice,
        paymentTokenIndex,
        paymentTokenBalance,
        paymentTokenDetailed,
        isBalanceInsufficient,

        // transactions
        openBoxTransaction,
        openBoxTransactionGasLimit,
        openBoxTransactionOverrides,
        setOpenBoxTransactionOverrides,

        // retry callbacks
        retryMaskBoxInfo,
        retryBoxInfo,
        retryBoxMetadata,
        retryMaskBoxCreationSuccessEvent,
        retryMaskBoxTokensForSale,
        retryMaskBoxPurchasedTokens,
    }
}

export const Context = createContainer(useContext)
