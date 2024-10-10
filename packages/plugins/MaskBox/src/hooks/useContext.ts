import { useEffect, useMemo, useState, useCallback } from 'react'
import { useAsyncRetry } from 'react-use'
import { fromUnixTime, addDays, subDays } from 'date-fns'
import { omit, clamp, first, uniq } from 'lodash-es'
import { BigNumber } from 'bignumber.js'
import { createContainer } from '@masknet/shared-base-ui'
import { unreachable } from '@masknet/kit'
import { useERC20TokenAllowance } from '@masknet/web3-hooks-evm'
import {
    useMaskBoxConstants,
    isZeroAddress,
    SchemaType,
    isNativeTokenAddress,
    abiCoder,
} from '@masknet/web3-shared-evm'
import type { NonPayableTx } from '@masknet/web3-contracts/types/types.js'
import { type BoxInfo, BoxState } from '../type.js'
import { useMaskBoxInfo } from './useMaskBoxInfo.js'
import { useMerkleProof } from './useMerkleProof.js'
import { useMaskBoxStatus } from './useMaskBoxStatus.js'
import { useMaskBoxCreationSuccessEvent } from './useMaskBoxCreationSuccessEvent.js'
import { useMaskBoxTokensForSale } from './useMaskBoxTokensForSale.js'
import { useMaskBoxPurchasedTokens } from './useMaskBoxPurchasedTokens.js'
import { formatCountdown } from '../helpers/formatCountdown.js'
import { useOpenBoxTransaction } from './useOpenBoxTransaction.js'
import { useMaskBoxMetadata } from './useMaskBoxMetadata.js'
import { useQualification } from './useQualification.js'
import {
    formatBalance,
    isGreaterThan,
    isGreaterThanOrEqualTo,
    isLessThanOrEqualTo,
    isSameAddress,
    multipliedBy,
} from '@masknet/web3-shared-base'
import { NetworkPluginID, EMPTY_LIST } from '@masknet/shared-base'
import {
    useChainContext,
    useBalance,
    useFungibleToken,
    useFungibleTokenBalance,
    useFungibleTokens,
    useNonFungibleTokenContract,
} from '@masknet/web3-hooks-base'

function useContext(initialState?: { boxId: string; hashRoot: string }) {
    const now = new Date()
    const { account } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    const { MASK_BOX_CONTRACT_ADDRESS } = useMaskBoxConstants()

    const [boxId, setBoxId] = useState(initialState?.boxId ?? '')
    const rootHash = initialState?.hashRoot || ''
    const [paymentTokenAddress, setPaymentTokenAddress] = useState('')

    // #region the box info
    const {
        value: maskBoxInfo = null,
        error: errorMaskBoxInfo,
        loading: loadingMaskBoxInfo,
        retry: retryMaskBoxInfo,
    } = useMaskBoxInfo(boxId)

    const {
        value: maskBoxStatus = null,
        error: errorMaskBoxStatus,
        loading: loadingMaskBoxStatus,
        retry: retryMaskBoxStatus,
    } = useMaskBoxStatus(boxId)
    const { value: maskBoxCreationSuccessEvent = null, retry: retryMaskBoxCreationSuccessEvent } =
        useMaskBoxCreationSuccessEvent(maskBoxInfo?.creator ?? '', maskBoxInfo?.nft_address ?? '', boxId)
    const { value: paymentTokens = EMPTY_LIST } = useFungibleTokens(
        NetworkPluginID.PLUGIN_EVM,
        maskBoxStatus?.payment?.map(([address]) => address) ?? [],
    )
    const { value: allTokens = EMPTY_LIST, retry: retryMaskBoxTokensForSale } = useMaskBoxTokensForSale(boxId)
    const { value: purchasedTokens = EMPTY_LIST, retry: retryMaskBoxPurchasedTokens } = useMaskBoxPurchasedTokens(
        boxId,
        account,
    )

    const {
        value: boxInfo = null,
        error: errorBoxInfo,
        loading: loadingBoxInfo,
        retry: retryBoxInfo,
    } = useAsyncRetry<BoxInfo | null>(async () => {
        if (!maskBoxInfo || !maskBoxStatus || !maskBoxInfo.creator || isZeroAddress(maskBoxInfo.creator)) return null
        const personalLimit = Number.parseInt(maskBoxInfo.personal_limit, 10)
        const remaining = Number.parseInt(maskBoxStatus.remaining, 10) // the current balance of the creator's account
        const total = Number.parseInt(maskBoxStatus.total, 10) // the total amount of tokens in the box
        const totalComputed = total && remaining && remaining > total ? remaining : total
        const sold = Math.max(0, totalComputed - remaining)
        const personalRemaining = Math.max(0, personalLimit - purchasedTokens.length)
        const startAt = Number.parseInt(maskBoxCreationSuccessEvent?.returnValues.start_time || '0', 10)
        const endAt = Number.parseInt(maskBoxCreationSuccessEvent?.returnValues.end_time || '0', 10)
        const info: BoxInfo = {
            boxId,
            creator: maskBoxInfo.creator,
            name: maskBoxInfo.name,
            sellAll: maskBoxCreationSuccessEvent?.returnValues.sell_all ?? false,
            personalLimit,
            personalRemaining,
            remaining,
            availableAmount: Math.min(personalRemaining, remaining),
            startAt: startAt === 0 ? subDays(new Date(), 1) : fromUnixTime(startAt),
            endAt: endAt === 0 ? addDays(new Date(), 1) : fromUnixTime(endAt),
            started: maskBoxStatus.started,
            total: totalComputed,
            sold,
            canceled: maskBoxStatus.canceled,
            tokenIds: allTokens,
            tokenIdsPurchased: purchasedTokens,
            payments: paymentTokens.map((token, i) => {
                return {
                    token,
                    price: maskBoxStatus.payment[i][1],
                    receivableAmount: maskBoxStatus.payment[i][2],
                }
            }),
            tokenAddress: maskBoxInfo.nft_address,
            heroImageURL: '',
            qualificationAddress: maskBoxInfo.qualification,
            holderTokenAddress: maskBoxInfo.holder_token_addr,
            holderMinTokenAmount: maskBoxInfo.holder_min_token_amount,
        }
        return info
    }, [allTokens, purchasedTokens, paymentTokens, maskBoxInfo, maskBoxStatus, maskBoxCreationSuccessEvent])
    // #endregion

    // #region qualification
    const { value, error: errorProof, loading: loadingProof } = useMerkleProof(rootHash)
    const proofBytes =
        value?.proof ? abiCoder.encodeParameters(['bytes32[]'], [value.proof.map((p) => `0x${p}`) ?? []]) : undefined
    const qualification = useQualification(
        boxInfo?.qualificationAddress,
        account,
        value?.proof ? abiCoder.encodeParameters(['bytes', 'bytes32'], [proofBytes, rootHash]) : undefined,
    )

    // not in whitelist
    const notInWhiteList = value?.message === 'leaf not found'

    // at least hold token amount
    const { data: holderToken } = useFungibleToken(NetworkPluginID.PLUGIN_EVM, boxInfo?.holderTokenAddress)
    const { data: holderTokenBalance = '0' } = useFungibleTokenBalance(NetworkPluginID.PLUGIN_EVM, holderToken?.address)
    const holderMinTokenAmountBN = new BigNumber(boxInfo?.holderMinTokenAmount ?? 0)
    const insufficientHolderToken =
        isGreaterThan(holderMinTokenAmountBN, 0) && !holderMinTokenAmountBN.lte(holderTokenBalance)
    // #endregion

    const boxState = useMemo(() => {
        if (notInWhiteList) {
            return BoxState.NOT_IN_WHITELIST
        }
        if (insufficientHolderToken) return BoxState.INSUFFICIENT_HOLDER_TOKEN
        if (qualification?.error_msg) return BoxState.NOT_QUALIFIED
        if (errorMaskBoxInfo || errorMaskBoxStatus || errorBoxInfo || (rootHash ? errorProof : false))
            return BoxState.ERROR
        if (loadingMaskBoxInfo || loadingMaskBoxStatus || loadingBoxInfo || (rootHash ? loadingProof : false)) {
            if (!maskBoxInfo && !boxInfo) return BoxState.UNKNOWN
        }
        if (maskBoxInfo && !boxInfo) return BoxState.UNKNOWN
        if (!maskBoxInfo || !maskBoxStatus || !boxInfo) return BoxState.NOT_FOUND
        if (maskBoxStatus.canceled) return BoxState.CANCELED
        if (isGreaterThanOrEqualTo(boxInfo.tokenIdsPurchased.length, boxInfo.personalLimit)) return BoxState.DREW_OUT
        if (isLessThanOrEqualTo(boxInfo.remaining, 0)) return BoxState.SOLD_OUT
        if (boxInfo.startAt > now || !boxInfo.started) return BoxState.NOT_READY
        if (boxInfo.endAt < now || maskBoxStatus?.expired) return BoxState.EXPIRED
        return BoxState.READY
    }, [
        boxInfo,
        loadingBoxInfo,
        errorBoxInfo,
        maskBoxInfo,
        loadingMaskBoxInfo,
        errorMaskBoxInfo,
        qualification,
        loadingProof,
        errorProof,
        rootHash,
        notInWhiteList,
        insufficientHolderToken,
    ])

    const boxStateMessage = useMemo(() => {
        switch (boxState) {
            case BoxState.UNKNOWN:
                return 'Loading...'
            case BoxState.CANCELED:
                return 'Canceled'
            case BoxState.READY:
                return 'Draw'
            case BoxState.EXPIRED:
                return 'Ended'
            case BoxState.NOT_READY:
                const nowAt = now.getTime()
                const startAt = boxInfo?.startAt.getTime() ?? 0
                if (startAt <= nowAt) return 'Syncing status...'
                const countdown = formatCountdown(startAt, nowAt)
                return countdown ? `Start sale in ${countdown}` : 'Loading...'
            case BoxState.SOLD_OUT:
                return 'Sold Out'
            case BoxState.NOT_IN_WHITELIST:
                return 'You are not in the whitelist.'
            case BoxState.INSUFFICIENT_HOLDER_TOKEN:
                const { symbol, decimals } = holderToken ?? {}
                const tokenPrice = `${formatBalance(boxInfo?.holderMinTokenAmount, decimals)} $${symbol}`
                return `You must hold at least ${tokenPrice}.`
            case BoxState.NOT_QUALIFIED:
                return qualification?.error_msg ?? 'Not qualified.'
            case BoxState.DREW_OUT:
                return 'Purchase limit exceeded.'
            case BoxState.ERROR:
                return 'Something went wrong.'
            case BoxState.NOT_FOUND:
                return 'Failed to load box info.'
            default:
                unreachable(boxState)
        }
    }, [holderToken, boxState, boxInfo?.startAt, qualification])

    useEffect(() => {
        if (!boxInfo || boxInfo.started) return

        if (boxInfo.startAt < now) {
            retryMaskBoxStatus()
        }
    }, [boxInfo])

    // #region the box metadata
    const { value: boxMetadata, retry: retryBoxMetadata } = useMaskBoxMetadata(boxId, boxInfo?.creator ?? '')
    // #endregion

    // #region the erc721 contract detailed
    const { value: contractDetailed } = useNonFungibleTokenContract(
        NetworkPluginID.PLUGIN_EVM,
        maskBoxInfo?.nft_address ?? '',
        SchemaType.ERC721,
        { account },
    )
    // #endregion

    // #region the payment count
    const [paymentCount, setPaymentCount] = useState(1)
    const setPaymentCount_ = useCallback(
        (count: number) => {
            setPaymentCount(clamp(count || 1, 1, boxInfo?.personalRemaining ?? 1))
        },
        [boxInfo?.personalRemaining],
    )
    // #endregion

    // #region token ids
    const [lastAllTokenIds, setLastAllTokenIds] = useState<string[]>([])
    const [lastPurchasedTokenIds, setLastPurchasedTokenIds] = useState<string[]>([])
    const refreshLastPurchasedTokenIds = useCallback(() => {
        setLastPurchasedTokenIds((tokenIds) => uniq([...tokenIds, ...purchasedTokens]))
    }, [purchasedTokens.length])
    // #endregion

    // #region the payment token
    const { data: paymentNativeTokenBalance = '0' } = useBalance()
    const { data: paymentERC20TokenBalance = '0' } = useFungibleTokenBalance(
        NetworkPluginID.PLUGIN_EVM,
        isNativeTokenAddress(paymentTokenAddress) ? '' : paymentTokenAddress,
    )
    const paymentTokenInfo = boxInfo?.payments.find((x) => isSameAddress(x.token.address, paymentTokenAddress))
    const paymentTokenIndex =
        boxInfo?.payments.findIndex((x) => isSameAddress(x.token.address ?? '', paymentTokenAddress)) ?? -1
    const paymentTokenPrice = paymentTokenInfo?.price ?? '0'
    const costAmount = multipliedBy(paymentTokenPrice, paymentCount)
    const isNativeToken = isNativeTokenAddress(paymentTokenAddress)
    const paymentTokenBalance = isNativeToken ? paymentNativeTokenBalance : paymentERC20TokenBalance
    const paymentTokenDetailed = paymentTokenInfo?.token ?? null
    const isBalanceInsufficient = costAmount.gt(paymentTokenBalance)

    {
        const firstPaymentTokenAddress = first(boxInfo?.payments)?.token.address
        if (paymentTokenAddress === '' && firstPaymentTokenAddress) setPaymentTokenAddress(firstPaymentTokenAddress)
    }
    // #endregion

    // #region transactions
    const [openBoxTransactionOverrides, setOpenBoxTransactionOverrides] = useState<NonPayableTx | null>(null)
    const openBoxTransaction = useOpenBoxTransaction(
        boxId,
        paymentCount,
        paymentTokenIndex,
        paymentTokenPrice,
        paymentTokenDetailed,
        proofBytes,
        openBoxTransactionOverrides,
    )
    const { data: erc20Allowance, refetch: retryAllowance } = useERC20TokenAllowance(
        isNativeToken ? undefined : paymentTokenAddress,
        MASK_BOX_CONTRACT_ADDRESS,
    )
    const canPurchase = !isBalanceInsufficient && !!boxInfo?.personalRemaining
    const allowToPurchase = boxState === BoxState.READY
    const isAllowanceEnough = isNativeToken ? true : costAmount.lte(erc20Allowance ?? '0')
    const { value: openBoxTransactionGasLimit } = useAsyncRetry(async () => {
        if (!openBoxTransaction || !canPurchase || !allowToPurchase || !isAllowanceEnough) return
        const estimatedGas = await openBoxTransaction.method.estimateGas(omit(openBoxTransaction.config, 'gas'))
        return new BigNumber(estimatedGas).toNumber()
    }, [openBoxTransaction, canPurchase, allowToPurchase, isAllowanceEnough])
    // #endregion

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
        isAllowanceEnough,

        // transactions
        openBoxTransaction,
        openBoxTransactionGasLimit,
        openBoxTransactionOverrides,
        setOpenBoxTransactionOverrides,

        // retry callbacks
        retryAllowance,
        retryMaskBoxInfo,
        retryMaskBoxStatus,
        retryBoxInfo,
        retryBoxMetadata,
        retryMaskBoxCreationSuccessEvent,
        retryMaskBoxTokensForSale,
        retryMaskBoxPurchasedTokens,
    }
}

export const Context = createContainer(useContext)
