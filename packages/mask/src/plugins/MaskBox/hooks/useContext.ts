import { useEffect, useMemo, useState, useCallback } from 'react'
import * as ABICoder from 'web3-eth-abi'
import { useAsyncRetry } from 'react-use'
import fromUnixTime from 'date-fns/fromUnixTime'
import addDays from 'date-fns/addDays'
import subDays from 'date-fns/subDays'
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
    useERC20TokenAllowance,
    useERC20TokenDetailed,
    useERC721ContractDetailed,
    useMaskBoxConstants,
    ZERO_ADDRESS,
    isZeroAddress,
    isNativeTokenAddress,
    formatBalance,
} from '@masknet/web3-shared-evm'
import type { NonPayableTx } from '@masknet/web3-contracts/types/types'
import { BoxInfo, BoxState } from '../type'
import { useMaskBoxInfo } from './useMaskBoxInfo'
import { useMerkelProof } from './useMerkleProof'
import { useMaskBoxStatus } from './useMaskBoxStatus'
import { useMaskBoxCreationSuccessEvent } from './useMaskBoxCreationSuccessEvent'
import { useMaskBoxTokensForSale } from './useMaskBoxTokensForSale'
import { useMaskBoxPurchasedTokens } from './useMaskBoxPurchasedTokens'
import { formatCountdown } from '../helpers/formatCountdown'
import { useOpenBoxTransaction } from './useOpenBoxTransaction'
import { useMaskBoxMetadata } from './useMaskBoxMetadata'
import { useQualification } from './useQualification'
import {
    isGreaterThan,
    isGreaterThanOrEqualTo,
    isLessThanOrEqualTo,
    multipliedBy,
    useBeat,
} from '@masknet/web3-shared-base'

function useContext(initialState?: { boxId: string; hashRoot: string }) {
    const now = new Date()
    const beat = useBeat()
    const account = useAccount()
    const chainId = useChainId()
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants(ChainId.Mainnet)
    const { MASK_BOX_CONTRACT_ADDRESS } = useMaskBoxConstants()
    const coder = ABICoder as unknown as ABICoder.AbiCoder

    const [boxId, setBoxId] = useState(initialState?.boxId ?? '')
    const [rootHash, setRootHash] = useState(initialState?.hashRoot || '')
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
    const { value: paymentTokens = [] } = useFungibleTokensDetailed(
        maskBoxStatus?.payment?.map(([address]) => ({
            type: isNativeTokenAddress(address) ? EthereumTokenType.Native : EthereumTokenType.ERC20,
            address,
        })) ?? [],
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
        if (!maskBoxInfo || !maskBoxStatus || isZeroAddress(maskBoxInfo?.creator ?? ZERO_ADDRESS)) return null
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
            personalLimit: personalLimit,
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
            payments: paymentTokens.map((token, i) => ({
                token: token,
                price: maskBoxStatus.payment[i][1],
                receivableAmount: maskBoxStatus.payment[i][2],
            })),
            tokenAddress: maskBoxInfo.nft_address,
            heroImageURL: '',
            qualificationAddress: maskBoxInfo.qualification,
            holderTokenAddress: maskBoxInfo.holder_token_addr,
            holderMinTokenAmount: maskBoxInfo.holder_min_token_amount,
        }
        return info
    }, [
        allTokens.join(),
        purchasedTokens.join(),
        paymentTokens?.map((x) => x.address).join(),
        maskBoxInfo,
        maskBoxStatus,
        maskBoxCreationSuccessEvent,
    ])
    // #endregion

    // #region qualification
    const { value, error: errorProof, loading: loadingProof } = useMerkelProof(rootHash)
    const proofBytes = value?.proof
        ? coder.encodeParameters(['bytes32[]'], [value?.proof?.map((p) => `0x${p}`) ?? []])
        : undefined
    const qualification = useQualification(
        boxInfo?.qualificationAddress,
        account,
        value?.proof ? coder.encodeParameters(['bytes', 'bytes32'], [proofBytes, rootHash]) : undefined,
    )

    // not in whitelist
    const notInWhiteList = value?.message === 'leaf not found'

    // at least hold token amount
    const { value: holderToken } = useERC20TokenDetailed(boxInfo?.holderTokenAddress)
    const { value: holderTokenBalance = '0' } = useERC20TokenBalance(holderToken?.address)
    const holderMinTokenAmountBN = new BigNumber(boxInfo?.holderMinTokenAmount ?? 0)
    const insufficientHolderToken =
        isGreaterThan(holderMinTokenAmountBN, 0) && !holderMinTokenAmountBN.lte(holderTokenBalance)
    // #endregion

    const boxState = useMemo(() => {
        if (notInWhiteList) return BoxState.NOT_IN_WHITELIST
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
        if (isGreaterThanOrEqualTo(boxInfo.tokenIdsPurchased.length, boxInfo.personalLimit)) return BoxState.DRAWED_OUT
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
        beat,
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
            case BoxState.DRAWED_OUT:
                return 'Purchase limit exceeded.'
            case BoxState.ERROR:
                return 'Something went wrong.'
            case BoxState.NOT_FOUND:
                return 'Failed to load box info.'
            default:
                unreachable(boxState)
        }
    }, [holderToken, boxState, boxInfo?.startAt, qualification, beat])

    useEffect(() => {
        if (!boxInfo || boxInfo.started) return

        if (boxInfo.startAt < now) {
            retryMaskBoxStatus()
        }
    }, [boxInfo, beat])

    // #region the box metadata
    const { value: boxMetadata, retry: retryBoxMetadata } = useMaskBoxMetadata(boxId, boxInfo?.creator ?? '')
    // #endregion

    // #region the erc721 contract detailed
    const { value: contractDetailed } = useERC721ContractDetailed(maskBoxInfo?.nft_address)
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
    const { value: paymentNativeTokenBalance = '0' } = useNativeTokenBalance()
    const { value: paymentERC20TokenBalance = '0' } = useERC20TokenBalance(
        isSameAddress(paymentTokenAddress, NATIVE_TOKEN_ADDRESS) ? '' : paymentTokenAddress,
    )
    const paymentTokenInfo = boxInfo?.payments.find((x) => isSameAddress(x.token.address, paymentTokenAddress))
    const paymentTokenIndex =
        boxInfo?.payments.findIndex((x) => isSameAddress(x.token.address ?? '', paymentTokenAddress)) ?? -1
    const paymentTokenPrice = paymentTokenInfo?.price ?? '0'
    const costAmount = multipliedBy(paymentTokenPrice, paymentCount)
    const isNativeToken = isSameAddress(paymentTokenAddress, NATIVE_TOKEN_ADDRESS)
    const paymentTokenBalance = isNativeToken ? paymentNativeTokenBalance : paymentERC20TokenBalance
    const paymentTokenDetailed = paymentTokenInfo?.token ?? null
    const isBalanceInsufficient = costAmount.gt(paymentTokenBalance)

    useEffect(() => {
        const firstPaymentTokenAddress = first(boxInfo?.payments)?.token.address
        if (paymentTokenAddress === '' && firstPaymentTokenAddress) setPaymentTokenAddress(firstPaymentTokenAddress)
    }, [paymentTokenAddress, boxInfo?.payments.map((x) => x.token.address).join()])
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
    const { value: erc20Allowance, retry: retryAllowance } = useERC20TokenAllowance(
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
