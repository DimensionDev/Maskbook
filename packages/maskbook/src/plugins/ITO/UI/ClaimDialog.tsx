import { useState, useMemo, useCallback, useEffect } from 'react'
import { createStyles, makeStyles, Typography, Slider, Grid } from '@material-ui/core'
import BigNumber from 'bignumber.js'

import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { ERC20TokenDetailed, EtherTokenDetailed, EthereumTokenType } from '../../../web3/types'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { TransactionStateType } from '../../../web3/hooks/useTransactionState'
import { WalletMessages, WalletRPC } from '../../Wallet/messages'
import { TokenAmountPanel } from '../../../web3/UI/TokenAmountPanel'
import { useTokenBalance } from '../../../web3/hooks/useTokenBalance'
import { useClaimCallback } from '../hooks/useClaimCallback'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useChainIdValid } from '../../../web3/hooks/useChainState'
import { formatBalance } from '../../../plugins/Wallet/formatter'
import { useConstant } from '../../../web3/hooks/useConstant'
import type { ChainId } from '../../../web3/types'
import { ApproveState, useERC20TokenApproveCallback } from '../../../web3/hooks/useERC20TokenApproveCallback'
import type { JSON_PayloadInMask } from '../types'
import { ITO_CONSTANTS } from '../constants'
import { EthereumStatusBar } from '../../../web3/UI/EthereumStatusBar'
import { ClaimStatus } from './ClaimGuide'
import { SelectERC20TokenDialog } from '../../../web3/UI/SelectERC20TokenDialog'
import { isSameAddress } from '../../../web3/helpers'

const useStyles = makeStyles((theme) =>
    createStyles({
        button: {},
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
                width: 28,
                height: 28,
                marginTop: -12,
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
    account: string
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
        account,
        token,
    } = props

    const classes = useStylesExtends(useStyles(), props)
    const chainIdValid = useChainIdValid()

    const [ratio, setRatio] = useState<BigNumber>(
        new BigNumber(payload.exchange_amounts[0 * 2]).dividedBy(new BigNumber(payload.exchange_amounts[0 * 2 + 1])),
    )
    const [claimToken, setClaimToken] = useState<EtherTokenDetailed | ERC20TokenDetailed>(payload.exchange_tokens[0])
    const [claimAmount, setClaimAmount] = useState<BigNumber>(initAmount.multipliedBy(ratio))
    const [inputAmountForUI, setInputAmountForUI] = useState(formatBalance(claimAmount, claimToken.decimals))

    //#region select token
    const [openSwapTokenDialog, setOpenSwapTokenDialog] = useState(false)
    //#endregion

    //#region balance
    const { value: tokenBalance = '0', loading: tokenBalanceLoading } = useTokenBalance(
        claimToken.type,
        claimToken.address,
    )
    //#endregion

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
        claimToken.type === EthereumTokenType.ERC20 ? claimToken.address : '',
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
        claimToken.type !== EthereumTokenType.Ether
    //#endregion

    //#region claim
    const [claimState, claimCallback, resetClaimCallback] = useClaimCallback(
        payload.pid,
        payload.password,
        claimAmount.toFixed(),
        claimToken,
    )
    const onClaim = useCallback(async () => {
        await claimCallback()
        if (payload.token.type === EthereumTokenType.ERC20) {
            await WalletRPC.addERC20Token(payload.token)
            await WalletRPC.trustERC20Token(account, payload.token)
        }
    }, [account, payload, claimCallback])

    const [_, setTransactionDialogOpen] = useRemoteControlledDialog(
        WalletMessages.events.transactionDialogUpdated,
        (ev) => {
            if (ev.open) return
            if (claimState.type !== TransactionStateType.CONFIRMED) return

            setStatus(ClaimStatus.Share)
            revalidateAvailability()
            resetClaimCallback()
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
    //#endregion

    const validationMessage = useMemo(() => {
        if (claimAmount.isGreaterThan(new BigNumber(tokenBalance)))
            return t('plugin_ito_error_balance', { symbol: claimToken.symbol })
        if (claimAmount.dividedBy(ratio).isGreaterThan(new BigNumber(payload.limit)))
            return t('plugin_ito_dialog_claim_swap_exceed_wallet_limit')
        return ''
    }, [claimAmount, tokenBalance, payload.limit, tokenBalanceLoading, t, claimToken, ratio])

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
                    onChange={(_, newValue) => {
                        const tAmount = new BigNumber(payload.limit).multipliedBy((newValue as number) / 100)
                        setTokenAmount(tAmount)
                        setClaimAmount(tAmount.multipliedBy(ratio))
                        setInputAmountForUI(formatBalance(tAmount.multipliedBy(ratio), claimToken.decimals))
                    }}
                />
                <Typography variant="body1" className={classes.swapLimitText}>
                    {formatBalance(new BigNumber(payload.limit), token.decimals ?? 0)} {token.symbol}
                </Typography>
            </section>
            <Typography className={classes.exchangeText} variant="body1" color="textSecondary">
                {t('plugin_ito_dialog_claim_swap_exchange')}{' '}
                <span className={classes.exchangeAmountText}>{formatBalance(tokenAmount, token.decimals ?? 0)}</span>{' '}
                {token.symbol}
            </Typography>
            <TokenAmountPanel
                amount={inputAmountForUI}
                maxAmount={BigNumber.min(new BigNumber(payload.limit).multipliedBy(ratio), tokenBalance).toFixed()}
                balance={tokenBalance}
                token={claimToken}
                onAmountChange={(value) => {
                    setInputAmountForUI(value)
                    const val =
                        value === ''
                            ? new BigNumber(0)
                            : new BigNumber(value).multipliedBy(new BigNumber(10).pow(claimToken.decimals))
                    setClaimAmount(val)
                    setTokenAmount(val.dividedBy(ratio))
                }}
                label={t('plugin_ito_dialog_claim_swap_panel_title')}
                SelectTokenChip={{
                    ChipProps: {
                        onClick: () => setOpenSwapTokenDialog(true),
                    },
                }}
            />
            <section className={classes.swapButtonWrapper}>
                <Grid container direction="row" justifyContent="center" alignItems="center" spacing={2}>
                    {approveRequired ? (
                        approveState === ApproveState.PENDING ? (
                            <Grid item xs={12}>
                                <ActionButton
                                    className={classes.button}
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    disabled={approveState === ApproveState.PENDING}>
                                    {`Unlocking ${claimToken.symbol ?? 'Token'}…`}
                                </ActionButton>
                            </Grid>
                        ) : (
                            <>
                                <Grid item xs={6}>
                                    <ActionButton
                                        className={classes.button}
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        onClick={onExactApprove}>
                                        {approveState === ApproveState.NOT_APPROVED
                                            ? t('plugin_wallet_token_unlock', {
                                                  balance: formatBalance(
                                                      new BigNumber(tokenAmount),
                                                      claimToken.decimals,
                                                      2,
                                                  ),
                                                  symbol: claimToken?.symbol ?? 'Token',
                                              })
                                            : ''}
                                    </ActionButton>
                                </Grid>
                                <Grid item xs={6}>
                                    <ActionButton
                                        className={classes.button}
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        onClick={onApprove}>
                                        {approveState === ApproveState.NOT_APPROVED
                                            ? t('plugin_wallet_token_infinite_unlock')
                                            : ''}
                                    </ActionButton>
                                </Grid>
                            </>
                        )
                    ) : (
                        <Grid item xs={12}>
                            {!account || !chainIdValid ? (
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
                                    disabled={!!validationMessage || approveRequired}
                                    onClick={onClaim}>
                                    {validationMessage || t('plugin_ito_swap')}
                                </ActionButton>
                            )}
                        </Grid>
                    )}
                </Grid>
            </section>

            <SelectERC20TokenDialog
                disableSearchBar
                includeTokens={props.exchangeTokens.map((x) => x.address)}
                excludeTokens={[]}
                selectedTokens={[]}
                open={openSwapTokenDialog}
                onSubmit={(token: EtherTokenDetailed | ERC20TokenDetailed) => {
                    const at = props.exchangeTokens.findIndex((x) => isSameAddress(x.address, token.address))
                    const ratio = new BigNumber(payload.exchange_amounts[at * 2]).dividedBy(
                        new BigNumber(payload.exchange_amounts[at * 2 + 1]),
                    )
                    setRatio(ratio)
                    setOpenSwapTokenDialog(false)
                    setClaimToken(token)
                    setTokenAmount(initAmount)
                    setClaimAmount(initAmount.multipliedBy(ratio))
                    setInputAmountForUI(formatBalance(initAmount.multipliedBy(ratio), token.decimals ?? 0))
                }}
                onClose={() => setOpenSwapTokenDialog(false)}
            />
        </>
    )
}
