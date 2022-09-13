import { openWindow } from '@masknet/shared-base-ui'
import { useSelectFungibleToken, useOpenShareTxDialog, FungibleTokenInput } from '@masknet/shared'
import { makeStyles, useStylesExtends, ActionButton } from '@masknet/theme'
import {
    leftShift,
    NetworkPluginID,
    rightShift,
    ZERO,
    FungibleToken,
    currySameAddress,
    formatBalance,
} from '@masknet/web3-shared-base'
import {
    ChainId,
    SchemaType,
    isNativeTokenAddress,
    useTokenConstants,
    explorerResolver,
} from '@masknet/web3-shared-evm'
import { Slider, Typography } from '@mui/material'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useI18N } from '../../../utils/index.js'
import { EthereumERC20TokenApprovedBoundary } from '../../../web3/UI/EthereumERC20TokenApprovedBoundary.js'
import { WalletConnectedBoundary } from '../../../web3/UI/WalletConnectedBoundary.js'
import type { JSON_PayloadInMask } from '../types.js'
import { useQualificationVerify } from './hooks/useQualificationVerify.js'
import { useSwapCallback } from './hooks/useSwapCallback.js'
import { SwapStatus } from './SwapGuide.js'
import { useChainId, useFungibleToken, useFungibleTokenBalance, useWeb3State } from '@masknet/plugin-infra/web3'

const useStyles = makeStyles()((theme) => ({
    button: {},
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
    exchangeTokens: Array<FungibleToken<ChainId, SchemaType.ERC20 | SchemaType.Native>>
    payload: JSON_PayloadInMask
    initAmount: BigNumber
    tokenAmount: BigNumber
    maxSwapAmount: BigNumber
    setTokenAmount: React.Dispatch<React.SetStateAction<BigNumber>>
    setActualSwapAmount: React.Dispatch<React.SetStateAction<BigNumber.Value>>
    setStatus: (status: SwapStatus) => void
    chainId: ChainId
    account: string
    token: FungibleToken<ChainId, SchemaType>
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

    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const { Token } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const classes = useStylesExtends(useStyles(), props)
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants()
    const [ratio, setRatio] = useState<BigNumber>(
        new BigNumber(payload.exchange_amounts[0 * 2]).dividedBy(payload.exchange_amounts[0 * 2 + 1]),
    )
    const { value: initToken } = useFungibleToken(NetworkPluginID.PLUGIN_EVM, payload.exchange_tokens[0].address)

    const [swapToken, setSwapToken] = useState<FungibleToken<ChainId, SchemaType> | undefined>(undefined)

    useEffect(() => {
        setSwapToken(initToken)
    }, [JSON.stringify(initToken)])

    const [swapAmount, setSwapAmount] = useState<BigNumber>(tokenAmount.multipliedBy(ratio))
    const [inputAmountForUI, setInputAmountForUI] = useState(
        swapAmount.isZero() ? '' : leftShift(swapAmount, swapToken?.decimals).toFixed(),
    )
    // #region select token
    const selectFungibleToken = useSelectFungibleToken(NetworkPluginID.PLUGIN_EVM)
    const onSelectTokenChipClick = useCallback(async () => {
        const picked = await selectFungibleToken({
            disableNativeToken: !exchangeTokens.some((x) => isNativeTokenAddress(x.address)),
            disableSearchBar: true,
            whitelist: exchangeTokens.map((x) => x.address),
        })
        if (!picked) return
        const at = exchangeTokens.findIndex(currySameAddress(picked.address))
        const ratio = new BigNumber(payload.exchange_amounts[at * 2]).dividedBy(payload.exchange_amounts[at * 2 + 1])
        setRatio(ratio)
        setSwapToken(picked)
        setTokenAmount(initAmount)
        setSwapAmount(initAmount.multipliedBy(ratio))
        setInputAmountForUI(
            initAmount.isZero() ? '' : leftShift(initAmount.multipliedBy(ratio), picked.decimals).toFixed(),
        )
    }, [
        initAmount,
        payload,
        selectFungibleToken,
        exchangeTokens
            .map((x) => x.address)
            .sort((a, b) => a.localeCompare(b, 'en-US'))
            .join(),
    ])
    // #endregion

    // #region balance
    const { value: tokenBalance = '0' } = useFungibleTokenBalance(
        NetworkPluginID.PLUGIN_EVM,
        swapToken ? swapToken.address : NATIVE_TOKEN_ADDRESS,
    )
    // #endregion

    // #region maxAmount for TokenAmountPanel
    const maxAmount = useMemo(
        () => BigNumber.min(maxSwapAmount.multipliedBy(ratio).dp(0), tokenBalance).toFixed(),
        [maxSwapAmount, ratio, tokenBalance],
    )
    // #endregion

    // #region swap
    const { value: qualificationInfo, loading: loadingQualification } = useQualificationVerify(
        payload.qualification_address,
        payload.contract_address,
    )

    const [{ loading: isSwapping }, swapCallback] = useSwapCallback(
        payload,
        swapAmount.toFixed(),
        swapToken ? swapToken : { address: NATIVE_TOKEN_ADDRESS },
        qualificationInfo?.isQualificationHasLucky,
    )
    const openShareTxDialog = useOpenShareTxDialog()
    const onSwap = useCallback(async () => {
        const receipt = await swapCallback()
        if (typeof receipt?.transactionHash === 'string') {
            await openShareTxDialog({
                hash: receipt.transactionHash,
            })
            const { to_value } = (receipt.events?.SwapSuccess.returnValues ?? {}) as {
                to_value: string
            }
            setActualSwapAmount(to_value)
            setStatus(SwapStatus.Share)
            setTimeout(() => {
                openWindow(explorerResolver.transactionLink(chainId, receipt.transactionHash))
            }, 2000)
        }
        if (payload.token.schema !== SchemaType.ERC20) return
        await Token?.addToken?.(account, payload.token)
    }, [swapCallback, payload.token, Token, account])

    const validationMessage = useMemo(() => {
        if (swapAmount.isZero() || tokenAmount.isZero() || swapAmount.dividedBy(ratio).isLessThan(1))
            return t('plugin_ito_error_enter_amount')
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
            <FungibleTokenInput
                label="Amount"
                amount={inputAmountForUI}
                maxAmount={maxAmount}
                balance={tokenBalance}
                token={swapToken}
                onAmountChange={(value) => {
                    const val = value === '' || value === '0' ? ZERO : rightShift(value, swapToken.decimals)
                    const isMax = value === leftShift(maxAmount, swapToken.decimals).toFixed() && !val.isZero()
                    const tokenAmount = isMax ? maxSwapAmount : val.dividedBy(ratio)
                    const swapAmount = isMax ? tokenAmount.multipliedBy(ratio) : val.dp(0)
                    setInputAmountForUI(
                        isMax ? leftShift(tokenAmount.multipliedBy(ratio), swapToken.decimals).toString() : value,
                    )
                    setTokenAmount(tokenAmount.dp(0))
                    setSwapAmount(swapAmount)
                }}
                onSelectToken={onSelectTokenChipClick}
            />
            <Typography className={classes.remindText} variant="body1" color="textSecondary">
                {t('plugin_ito_swap_only_once_remind')}
            </Typography>
            <section className={classes.swapButtonWrapper}>
                <WalletConnectedBoundary>
                    <EthereumERC20TokenApprovedBoundary
                        onlyInfiniteUnlock
                        amount={swapAmount.toFixed()}
                        spender={payload.contract_address}
                        token={swapToken.schema === SchemaType.ERC20 ? swapToken : undefined}>
                        <ActionButton
                            loading={isSwapping || loadingQualification}
                            className={classes.button}
                            fullWidth
                            size="large"
                            disabled={!!validationMessage || loadingQualification || isSwapping}
                            onClick={onSwap}>
                            {validationMessage || t('plugin_ito_swap')}
                        </ActionButton>
                    </EthereumERC20TokenApprovedBoundary>
                </WalletConnectedBoundary>
            </section>
        </>
    ) : null
}
