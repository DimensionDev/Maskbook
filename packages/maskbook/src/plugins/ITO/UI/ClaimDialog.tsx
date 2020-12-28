import { createStyles, makeStyles, Typography, Slider } from '@material-ui/core'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import BigNumber from 'bignumber.js'
import { ERC20TokenDetailed, EtherTokenDetailed, EthereumTokenType } from '../../../web3/types'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { TransactionStateType } from '../../../web3/hooks/useTransactionState'
import { WalletMessages } from '../../Wallet/messages'
import { TokenAmountPanel } from '../../../web3/UI/TokenAmountPanel'
import { useTokenBalance } from '../../../web3/hooks/useTokenBalance'
import { useClaimCallback } from '../hooks/useClaimCallback'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useChainIdValid } from '../../../web3/hooks/useChainState'
import { formatBalance } from '../../../plugins/Wallet/formatter'
import { useConstant } from '../../../web3/hooks/useConstant'
import type { ChainId } from '../../../web3/types'
import { ApproveState, useERC20TokenApproveCallback } from '../../../web3/hooks/useERC20TokenApproveCallback'
import type { JSON_PayloadInMask } from '../types'
import { ITO_CONSTANTS } from '../constants'
import { useState, useMemo, useCallback, useEffect } from 'react'
import { EthereumStatusBar } from '../../../web3/UI/EthereumStatusBar'
import { getSupportTokenInfo } from './ITO'
import { SelectSwapTokenDialog } from './SelectSwapTokenDialog'
import { ClaimStatus } from './ClaimGuide'

const useStyles = makeStyles((theme) =>
    createStyles({
        button: {
            width: 'fit-content',
            margin: '0 auto',
        },
        providerWrapper: {
            display: 'flex',
            flexDirection: 'row-reverse',
            alignItems: 'center',
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
            fontSize: '14px',
            width: 'fit-content',
        },
        swapLimitSlider: {
            flexGrow: 1,
            width: 'auto !important',
            margin: theme.spacing(0, 3),
            '& .MuiSlider-thumb': {
                width: '28px',
                height: '28px',
                marginTop: '-12px',
                background: theme.palette.mode === 'dark' ? '#fff' : '2CA4EF, 100%',
            },
            '& .MuiSlider-rail': {
                height: '5px',
            },
            '& .MuiSlider-track': {
                height: '5px',
            },
        },
        exchangeText: {
            marginTop: theme.spacing(1),
            color: '#6F767C',
        },
        exchangeAmountText: {
            color: theme.palette.mode === 'dark' ? '#fff' : '#15181B',
        },
        swapInput: {
            marginTop: theme.spacing(3),

            '& > div': {
                padding: theme.spacing(1.2, 2, 2),
                display: 'flex',
                alignItems: 'flex-end',
            },

            '& input': {
                paddingBottom: theme.spacing(1.2),
            },
        },
        swapInputChipMax: {
            marginRight: theme.spacing(0.5),
            borderRadius: 100,
        },
        swapInputChipBalance: {
            fontSize: '1rem',
            color: theme.palette.mode === 'dark' ? '#fff' : '#15181B',
            marginBottom: theme.spacing(3.5),
        },
        swapInputChipToken: {
            border: 'none',
            borderRadius: 8,
            padding: theme.spacing(1, 0, 1, 1),
            fontSize: 17,
            height: 39,
            fontWeight: 300,
            '& svg': {
                fontSize: 32,
            },
        },
        swapChipWrapper: {
            display: 'flex',
            alignItems: 'center',
        },
        swapInputChipTokenIcon: {
            fontSize: 32,
            width: 52,
            height: 52,
        },
        swapButtonWrapper: {
            display: 'flex',
            justifyContent: 'center',
            marginTop: theme.spacing(2),
        },
        swapButton: {
            width: 'fit-content',
            margin: theme.spacing(0, 1),
        },
    }),
)

export interface ClaimDialogProps extends withClasses<'root'> {
    exchangeTokens: (EtherTokenDetailed | ERC20TokenDetailed)[]
    payload: JSON_PayloadInMask
    revalidateAvailability: () => void
    initAmount: BigNumber
    tokenAmount: BigNumber
    setTokenAmount: React.Dispatch<React.SetStateAction<BigNumber>>
    setStatus: React.Dispatch<React.SetStateAction<ClaimStatus>>
    chainId: ChainId
    token: EtherTokenDetailed | ERC20TokenDetailed
}

export function ClaimDialog(props: ClaimDialogProps) {
    const { t } = useI18N()
    const {
        payload,
        revalidateAvailability,
        initAmount,
        tokenAmount,
        setTokenAmount,
        setStatus,
        chainId,
        token,
    } = props
    const classes = useStylesExtends(useStyles(), props)
    const [swapToken, setSwapToken] = useState<EtherTokenDetailed | ERC20TokenDetailed>(payload.exchange_tokens[0])
    const [ratio, setRatio] = useState<BigNumber>(
        new BigNumber(payload.exchange_amounts[0 * 2 + 1]).dividedBy(new BigNumber(payload.exchange_amounts[0 * 2])),
    )
    const { value: tokenBalance = '0', loading: tokenBalanceLoading } = useTokenBalance(
        swapToken.type,
        swapToken.address,
    )
    const [claimAmount, setClaimAmount] = useState<BigNumber>(initAmount.multipliedBy(ratio))
    const [openSwapTokenDialog, setOpenSwapTokenDialog] = useState(false)
    const account = useAccount()
    const chainIdValid = useChainIdValid()
    const { tokenIconListTable } = getSupportTokenInfo(chainId)
    const CurrentSwapTokenIcon = tokenIconListTable[swapToken.address]

    const claimAmountErrText = useMemo(() => {
        const amount = claimAmount.dividedBy(ratio)
        if (tokenBalanceLoading) return ''
        return claimAmount.isGreaterThan(new BigNumber(tokenBalance))
            ? t('plugin_ito_error_balance', { symbol: swapToken.symbol })
            : amount.isGreaterThan(new BigNumber(payload.limit))
            ? t('plugin_ito_dialog_claim_swap_exceed_wallet_limit')
            : ''
    }, [claimAmount, tokenBalance, payload.limit, tokenBalanceLoading, t, swapToken, ratio])

    const [inputAmountForUI, setInputAmountForUI] = useState(formatBalance(claimAmount, swapToken.decimals ?? 0))

    const handleInputChange = useCallback(
        (event) => {
            const r = Number(event.target.value) / 100
            const tAmount = new BigNumber(payload.limit).multipliedBy(r)
            setTokenAmount(tAmount)
            setClaimAmount(tAmount.multipliedBy(ratio))
            setInputAmountForUI(formatBalance(tAmount.multipliedBy(ratio), swapToken.decimals ?? 0))
        },
        [payload.limit, ratio, swapToken, setTokenAmount],
    )

    //#region remote controlled select provider dialog
    const [, setSelectProviderDialogOpen] = useRemoteControlledDialog(WalletMessages.events.selectProviderDialogUpdated)
    const onConnect = useCallback(() => {
        setSelectProviderDialogOpen({
            open: true,
        })
    }, [setSelectProviderDialogOpen])
    //#endregion

    //#region approve
    const ITO_CONTRACT_ADDRESS = useConstant(ITO_CONSTANTS, 'ITO_CONTRACT_ADDRESS')
    const [approveState, approveCallback] = useERC20TokenApproveCallback(
        swapToken.type === EthereumTokenType.ERC20 ? swapToken.address : '',
        claimAmount.toFixed(),
        ITO_CONTRACT_ADDRESS,
    )

    const onApprove = useCallback(async () => {
        if (approveState !== ApproveState.NOT_APPROVED) return
        await approveCallback()
    }, [approveState, approveCallback])
    const onExactApprove = useCallback(async () => {
        if (approveState !== ApproveState.NOT_APPROVED) return
        await approveCallback(true)
    }, [approveState, approveCallback])
    const approveRequired =
        (approveState === ApproveState.NOT_APPROVED || approveState === ApproveState.PENDING) &&
        swapToken.type !== EthereumTokenType.Ether
    //#endregion

    const sendTxValidation = useMemo(() => claimAmountErrText !== '' || tokenAmount.toFixed() === '0', [
        claimAmountErrText,
        tokenAmount,
    ])

    const [claimState, claimCallback, resetCallback] = useClaimCallback(
        payload.pid,
        payload.password,
        claimAmount.toFixed(),
        swapToken,
    )
    //#region claim
    const onSwap = useCallback(() => {
        claimCallback()
    }, [claimCallback])
    //#endregion

    const [_, setTransactionDialogOpen] = useRemoteControlledDialog(
        WalletMessages.events.transactionDialogUpdated,
        (ev) => {
            if (ev.open) return
            // reset state
            resetCallback()

            if (claimState.type !== TransactionStateType.CONFIRMED) return

            revalidateAvailability()
            setStatus(ClaimStatus.Share)
        },
    )

    useEffect(() => {
        if (claimState.type === TransactionStateType.UNKNOWN) return
        setTransactionDialogOpen({
            open: true,
            state: claimState,
            summary: `${t('plugin_trader_swap')} ${formatBalance(tokenAmount, token.decimals ?? 0)} ${token.symbol}`,
        })
    }, [claimState])

    return (
        <>
            <section className={classes.providerWrapper}>
                <EthereumStatusBar classes={{ root: classes.providerBar }} />
            </section>
            <section className={classes.swapLimitWrap}>
                <Typography variant="body1" className={classes.swapLimitText}>
                    0 {token.symbol}
                </Typography>
                <Slider
                    className={classes.swapLimitSlider}
                    value={Number(tokenAmount.dividedBy(payload.limit).multipliedBy(100))}
                    onChange={handleInputChange}
                />
                <Typography variant="body1" className={classes.swapLimitText}>
                    {formatBalance(new BigNumber(payload.limit), token.decimals ?? 0)} {token.symbol}
                </Typography>
            </section>
            <Typography variant="body1" className={classes.exchangeText}>
                {t('plugin_ito_dialog_claim_swap_exchange')}{' '}
                <span className={classes.exchangeAmountText}>{formatBalance(tokenAmount, token.decimals ?? 0)}</span>{' '}
                {token.symbol}
            </Typography>
            <TokenAmountPanel
                classes={{ root: classes.swapInput }}
                balance={tokenBalance}
                viewBalance={true}
                amount={inputAmountForUI}
                token={swapToken}
                onAmountChange={(value) => {
                    setInputAmountForUI(value)
                    const val =
                        value === ''
                            ? new BigNumber(0)
                            : new BigNumber(Number(value)).multipliedBy(Math.pow(10, swapToken.decimals))
                    console.log('setClaimAmount', val.toFixed())
                    setClaimAmount(val)
                    setTokenAmount(val.dividedBy(ratio))
                }}
                label={t('plugin_ito_dialog_claim_swap_panel_title')}
                SelectTokenChip={{
                    loading: false,
                    ChipProps: {
                        onClick: () => setOpenSwapTokenDialog(true),
                        classes: {
                            root: classes.swapInputChipToken,
                            icon: classes.swapInputChipTokenIcon,
                        },
                    },
                }}
                MaxChipProps={{
                    className: classes.swapInputChipMax,
                }}
                swapLimit={new BigNumber(payload.limit).multipliedBy(ratio).toFixed()}
                balanceClassName={classes.swapInputChipBalance}
                chipWrapper={classes.swapChipWrapper}
                currentIcon={<CurrentSwapTokenIcon />}
                TextFieldProps={{
                    error: claimAmountErrText !== '',
                    helperText: claimAmountErrText,
                }}
            />
            <section className={classes.swapButtonWrapper}>
                {approveRequired ? (
                    approveState === ApproveState.PENDING ? (
                        <ActionButton
                            variant="contained"
                            color="primary"
                            className={classes.swapButton}
                            disabled={approveState === ApproveState.PENDING}>
                            {`Unlocking ${swapToken.symbol}…`}
                        </ActionButton>
                    ) : (
                        <>
                            <ActionButton
                                variant="contained"
                                color="primary"
                                className={classes.swapButton}
                                onClick={() => {
                                    onApprove()
                                }}
                                disabled={sendTxValidation}>
                                {t('plugin_wallet_token_infinite_unlock')} {swapToken.symbol}
                            </ActionButton>
                            <ActionButton
                                variant="contained"
                                color="primary"
                                className={classes.swapButton}
                                onClick={() => {
                                    onExactApprove()
                                }}
                                disabled={sendTxValidation}>
                                {t('plugin_wallet_token_unlock', {
                                    balance: claimAmount.toFixed(),
                                    symbol: swapToken.symbol ?? 'Token',
                                })}{' '}
                            </ActionButton>
                        </>
                    )
                ) : !account || !chainIdValid ? (
                    <ActionButton
                        className={classes.button}
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={onConnect}>
                        {t('plugin_wallet_connect_a_wallet')}
                    </ActionButton>
                ) : (
                    <ActionButton
                        className={classes.button}
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={sendTxValidation || approveRequired}
                        onClick={onSwap}>
                        {t('plugin_trader_swap')}
                    </ActionButton>
                )}
            </section>

            <SelectSwapTokenDialog
                onSelect={(token: EtherTokenDetailed | ERC20TokenDetailed) => {
                    const i = props.exchangeTokens.indexOf(token)
                    const r = new BigNumber(payload.exchange_amounts[i * 2 + 1]).dividedBy(
                        new BigNumber(payload.exchange_amounts[i * 2]),
                    )
                    setRatio(r)
                    setOpenSwapTokenDialog(false)
                    setSwapToken(token)
                    setTokenAmount(initAmount)
                    setClaimAmount(initAmount.multipliedBy(r))
                    setInputAmountForUI(formatBalance(initAmount.multipliedBy(r), token.decimals ?? 0))
                }}
                exchangeTokens={props.exchangeTokens}
                open={openSwapTokenDialog}
                onClose={() => setOpenSwapTokenDialog(false)}
            />
        </>
    )
}
