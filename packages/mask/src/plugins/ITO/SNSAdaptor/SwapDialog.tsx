import { useCallback, useEffect, useMemo, useState } from 'react'
import BigNumber from 'bignumber.js'
import { v4 as uuid } from 'uuid'
import { CircularProgress, Slider, Typography } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { useI18N } from '../../../utils'
import { useRemoteControlledDialog } from '@masknet/shared'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import {
    ChainId,
    currySameAddress,
    EthereumTokenType,
    formatBalance,
    FungibleTokenDetailed,
    isNative,
    resolveTransactionLinkOnExplorer,
    TransactionStateType,
    useChainId,
    useFungibleTokenBalance,
    useFungibleTokenDetailed,
    isSameAddress,
    useTokenConstants,
} from '@masknet/web3-shared-evm'
import { leftShift, rightShift, ZERO } from '@masknet/web3-shared-base'
import { SelectTokenDialogEvent, WalletMessages, WalletRPC } from '../../Wallet/messages'
import { TokenAmountPanel } from '../../../web3/UI/TokenAmountPanel'
import { useSwapCallback } from './hooks/useSwapCallback'
import type { JSON_PayloadInMask } from '../types'
import { SwapStatus } from './SwapGuide'
import { EthereumERC20TokenApprovedBoundary } from '../../../web3/UI/EthereumERC20TokenApprovedBoundary'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import { useQualificationVerify } from './hooks/useQualificationVerify'

const useStyles = makeStyles()((theme) => ({
    button: {
        marginTop: theme.spacing(1.5),
    },
    providerBar: {},
    swapLimitWrap: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: theme.spacing(2),
    },
    swapLimitText: {
        color: theme.palette.mode === 'dark' ? '#fff' : '#15181B',
        fontSize: 14,
        width: 'fit-content',
    },
    swapLimitSlider: {
        flexGrow: 1,
        width: 'auto !important',
        margin: theme.spacing(0, 3),
        '& .MuiSlider-thumb': {
            width: 28,
            height: 28,
            background: theme.palette.mode === 'dark' ? '#fff' : '2CA4EF, 100%',
        },
        '& .MuiSlider-rail': {
            height: 5,
        },
        '& .MuiSlider-track': {
            height: 5,
        },
    },
    exchangeText: {
        textAlign: 'right',
        fontSize: 10,
        margin: theme.spacing(1, 0, 3),
    },
    exchangeAmountText: {
        color: theme.palette.mode === 'dark' ? '#fff' : '#15181B',
    },
    swapButtonWrapper: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: theme.spacing(2),
    },
    remindText: {
        fontSize: 10,
        marginTop: theme.spacing(1),
    },
    loading: {
        color: theme.palette.text.primary,
    },
}))

export interface SwapDialogProps extends withClasses<'root'> {
    exchangeTokens: FungibleTokenDetailed[]
    payload: JSON_PayloadInMask
    initAmount: BigNumber
    tokenAmount: BigNumber
    maxSwapAmount: BigNumber
    setTokenAmount: React.Dispatch<React.SetStateAction<BigNumber>>
    setActualSwapAmount: React.Dispatch<React.SetStateAction<BigNumber.Value>>
    setStatus: (status: SwapStatus) => void
    chainId: ChainId
    account: string
    token: FungibleTokenDetailed
}

export function SwapDialog(props: SwapDialogProps) {
    const { t } = useI18N()
    const {
        payload,
        initAmount,
        tokenAmount,
        maxSwapAmount,
        setTokenAmount,
        setActualSwapAmount,
        setStatus,
        account,
        token,
        exchangeTokens,
    } = props

    const chainId = useChainId()
    const classes = useStylesExtends(useStyles(), props)
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants()
    const [ratio, setRatio] = useState<BigNumber>(
        new BigNumber(payload.exchange_amounts[0 * 2]).dividedBy(payload.exchange_amounts[0 * 2 + 1]),
    )
    const { value: initToken } = useFungibleTokenDetailed(
        isSameAddress(NATIVE_TOKEN_ADDRESS, payload.exchange_tokens[0].address)
            ? EthereumTokenType.Native
            : EthereumTokenType.ERC20,
        payload.exchange_tokens[0].address,
    )

    const [swapToken, setSwapToken] = useState<FungibleTokenDetailed | undefined>(undefined)

    useEffect(() => {
        setSwapToken(initToken)
    }, [JSON.stringify(initToken)])

    const [swapAmount, setSwapAmount] = useState<BigNumber>(tokenAmount.multipliedBy(ratio))
    const [inputAmountForUI, setInputAmountForUI] = useState(
        swapAmount.isZero() ? '' : formatBalance(swapAmount, swapToken?.decimals),
    )

    //#region select token
    const [id] = useState(uuid())
    const { setDialog: setSelectTokenDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectTokenDialogUpdated,
        useCallback(
            (ev: SelectTokenDialogEvent) => {
                if (ev.open || !ev.token || ev.uuid !== id) return
                const at = exchangeTokens.findIndex(currySameAddress(ev.token!.address))
                const ratio = new BigNumber(payload.exchange_amounts[at * 2]).dividedBy(
                    payload.exchange_amounts[at * 2 + 1],
                )
                setRatio(ratio)
                setSwapToken(ev.token)
                setTokenAmount(initAmount)
                setSwapAmount(initAmount.multipliedBy(ratio))
                setInputAmountForUI(
                    initAmount.isZero() ? '' : formatBalance(initAmount.multipliedBy(ratio), ev.token.decimals),
                )
            },
            [
                id,
                payload,
                initAmount,
                exchangeTokens
                    .map((x) => x.address)
                    .sort()
                    .join(),
            ],
        ),
    )
    const onSelectTokenChipClick = useCallback(() => {
        setSelectTokenDialog({
            open: true,
            uuid: id,
            disableNativeToken: !exchangeTokens.some((x) => isNative(x.address)),
            disableSearchBar: true,
            FixedTokenListProps: {
                whitelist: exchangeTokens.map((x) => x.address),
            },
        })
    }, [
        exchangeTokens
            .map((x) => x.address)
            .sort()
            .join(),
    ])
    //#endregion

    //#region balance
    const { value: tokenBalance = '0' } = useFungibleTokenBalance(
        swapToken ? swapToken.type : EthereumTokenType.Native,
        swapToken ? swapToken.address : NATIVE_TOKEN_ADDRESS,
    )
    //#endregion

    //#region maxAmount for TokenAmountPanel
    const maxAmount = useMemo(
        () => BigNumber.min(maxSwapAmount.multipliedBy(ratio).dp(0), tokenBalance).toFixed(),
        [maxSwapAmount, ratio, tokenBalance],
    )
    //#endregion

    //#region swap
    const { value: qualificationInfo, loading: loadingQualification } = useQualificationVerify(
        payload.qualification_address,
        payload.contract_address,
    )

    const [swapState, swapCallback, resetSwapCallback] = useSwapCallback(
        payload,
        swapAmount.toFixed(),
        swapToken ? swapToken : { address: NATIVE_TOKEN_ADDRESS },
        qualificationInfo?.isQualificationHasLucky,
    )
    const onSwap = useCallback(async () => {
        await swapCallback()
        if (payload.token.type !== EthereumTokenType.ERC20) return
        await WalletRPC.addToken(payload.token)
        await WalletRPC.updateWalletToken(account, payload.token, { strategy: 'trust' })
    }, [swapCallback, payload.token.address])

    const { setDialog: setTransactionDialog } = useRemoteControlledDialog(
        WalletMessages.events.transactionDialogUpdated,
        (ev) => {
            if (ev.open) return
            if (swapState.type === TransactionStateType.CONFIRMED && !swapState.receipt.status) resetSwapCallback()
            if (swapState.type !== TransactionStateType.CONFIRMED && swapState.type !== TransactionStateType.RECEIPT)
                return
            const { receipt } = swapState
            const { to_value } = (receipt.events?.SwapSuccess.returnValues ?? {}) as { to_value: string }
            setActualSwapAmount(to_value)
            setStatus(SwapStatus.Share)
            resetSwapCallback()
        },
    )

    useEffect(() => {
        if (swapState.type === TransactionStateType.UNKNOWN) return

        if (swapState.type === TransactionStateType.HASH) {
            const { hash } = swapState
            setTimeout(() => {
                window.open(resolveTransactionLinkOnExplorer(chainId, hash), '_blank', 'noopener noreferrer')
            }, 2000)
            return
        }

        setTransactionDialog({
            open: true,
            state: swapState,
            summary: t('plugin_ito_swapping', {
                amount: formatBalance(tokenAmount, token.decimals),
                symbol: token.symbol,
            }),
        })
    }, [swapState])
    //#endregion

    const validationMessage = useMemo(() => {
        if (swapAmount.isZero()) return t('plugin_ito_error_enter_amount')
        if (swapAmount.isGreaterThan(tokenBalance)) return t('plugin_ito_error_balance', { symbol: swapToken?.symbol })
        if (tokenAmount.isGreaterThan(maxSwapAmount)) return t('plugin_ito_dialog_swap_exceed_wallet_limit')
        return ''
    }, [swapAmount, tokenBalance, maxSwapAmount, swapToken, ratio])

    return swapToken ? (
        <>
            <section className={classes.swapLimitWrap}>
                <Typography variant="body1" className={classes.swapLimitText}>
                    0 {token.symbol}
                </Typography>
                <Slider
                    className={classes.swapLimitSlider}
                    value={Number(tokenAmount.dividedBy(maxSwapAmount).multipliedBy(100))}
                    onChange={(_, newValue) => {
                        const tokenAmount = maxSwapAmount.multipliedBy((newValue as number) / 100)
                        const swapAmount = tokenAmount.multipliedBy(ratio).dp(0)
                        setTokenAmount(tokenAmount.dp(0))
                        setSwapAmount(swapAmount)
                        setInputAmountForUI(formatBalance(swapAmount, swapToken.decimals))
                    }}
                />
                <Typography variant="body1" className={classes.swapLimitText}>
                    {formatBalance(maxSwapAmount, token.decimals)} {token.symbol}
                </Typography>
            </section>
            <Typography className={classes.exchangeText} variant="body1" color="textSecondary">
                {t('plugin_ito_dialog_swap_exchange')}{' '}
                <span className={classes.exchangeAmountText}>{formatBalance(tokenAmount, token.decimals)}</span>{' '}
                {token.symbol}.
            </Typography>
            <TokenAmountPanel
                amount={inputAmountForUI}
                maxAmount={maxAmount}
                balance={tokenBalance}
                token={swapToken}
                onAmountChange={(value) => {
                    const val = value === '' || value === '0' ? ZERO : leftShift(value, swapToken.decimals)
                    const isMax = value === formatBalance(maxAmount, swapToken.decimals) && !val.isZero()
                    const tokenAmount = isMax ? maxSwapAmount : val.dividedBy(ratio)
                    const swapAmount = isMax ? tokenAmount.multipliedBy(ratio) : val.dp(0)
                    setInputAmountForUI(
                        isMax ? rightShift(tokenAmount.multipliedBy(ratio), swapToken.decimals).toString() : value,
                    )
                    setTokenAmount(tokenAmount.dp(0))
                    setSwapAmount(swapAmount)
                }}
                label={t('plugin_ito_dialog_swap_panel_title')}
                SelectTokenChip={{
                    ChipProps: {
                        onClick: onSelectTokenChipClick,
                    },
                }}
            />
            <Typography className={classes.remindText} variant="body1" color="textSecondary">
                {t('plugin_ito_swap_only_once_remind')}
            </Typography>
            <section className={classes.swapButtonWrapper}>
                <EthereumWalletConnectedBoundary>
                    <EthereumERC20TokenApprovedBoundary
                        amount={swapAmount.toFixed()}
                        spender={payload.contract_address}
                        token={swapToken.type === EthereumTokenType.ERC20 ? swapToken : undefined}>
                        <ActionButton
                            className={classes.button}
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={!!validationMessage || loadingQualification}
                            onClick={onSwap}>
                            {loadingQualification ? (
                                <CircularProgress size={16} className={classes.loading} />
                            ) : (
                                validationMessage || t('plugin_ito_swap')
                            )}
                        </ActionButton>
                    </EthereumERC20TokenApprovedBoundary>
                </EthereumWalletConnectedBoundary>
            </section>
        </>
    ) : null
}
