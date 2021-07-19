import { useRemoteControlledDialog } from '@masknet/shared'
import {
    EthereumTokenType,
    formatBalance,
    FungibleTokenDetailed,
    isZero,
    pow10,
    TransactionStateType,
    useAccount,
    useTokenBalance,
} from '@masknet/web3-shared'
import { DialogContent, Grid, makeStyles, Typography } from '@material-ui/core'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { v4 as uuid } from 'uuid'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { activatedSocialNetworkUI } from '../../../social-network'
import { isTwitter } from '../../../social-network-adaptor/twitter.com/base'
import { useI18N } from '../../../utils/i18n-next-ui'
import { EthereumERC20TokenApprovedBoundary } from '../../../web3/UI/EthereumERC20TokenApprovedBoundary'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import { TokenAmountPanel } from '../../../web3/UI/TokenAmountPanel'
import { PluginTraderMessages } from '../../Trader/messages'
import type { Coin } from '../../Trader/types'
import { SelectTokenDialogEvent, WalletMessages } from '../../Wallet/messages'
import { ADDRESS_ZERO } from '../constants'
import { useDepositCallback } from '../hooks/useDepositCallback'
import { PluginPoolTogetherMessages } from '../messages'
import type { Pool } from '../types'
import { calculateOdds } from '../utils'

const useStyles = makeStyles((theme) => ({
    root: {
        margin: theme.spacing(2, 0),
        backgroundColor: '#1a083a',
    },
    form: {
        '& > *': {
            margin: theme.spacing(1, 0),
        },
    },

    tip: {
        fontSize: 12,
        color: theme.palette.text.secondary,
        padding: theme.spacing(2, 2, 0, 2),
    },
    button: {
        margin: theme.spacing(1.5, 0, 0),
        padding: 12,
        backgroundColor: '#3ef3d4',
    },
    odds: {
        textAlign: 'center',
        padding: theme.spacing(3),
    },
    oddsTitle: {
        color: '#bdb3d2',
    },
    oddsValue: {
        background:
            'linear-gradient(40deg,#ff9304,#ff04ea 10%,#9b4beb 20%,#0e8dd6 30%,#0bc6df 40%,#07d464 50%,#dfd105 60%,#ff04ab 78%,#8933eb 90%,#3b89ff)',
        '-webkit-background-clip': 'text',
        color: 'transparent',
        animation: '$rainbow_animation 6s linear infinite',
        backgroundSize: '600% 600%',
        fontSize: '1.2rem',
    },
    '@keyframes rainbow_animation': {
        '0%': {
            backgroundPosition: '100% 0%',
        },
        '100%': {
            backgroundPosition: '0 100%',
        },
    },
}))

export function DepositDialog() {
    const { t } = useI18N()
    const classes = useStyles()

    const [id] = useState(uuid())
    const [pool, setPool] = useState<Pool>()
    const [token, setToken] = useState<FungibleTokenDetailed>()
    const [odds, setOdds] = useState<string>()

    // context
    const account = useAccount()

    //#region remote controlled dialog
    const { open, closeDialog } = useRemoteControlledDialog(
        PluginPoolTogetherMessages.events.DepositDialogUpdated,
        (ev) => {
            if (ev.open) {
                setPool(ev.pool)
                setToken(ev.token)
            }
        },
    )
    const onClose = useCallback(() => {
        closeDialog()
    }, [closeDialog])
    //#endregion

    //#region select token
    const { setDialog: setSelectTokenDialogOpen } = useRemoteControlledDialog(
        WalletMessages.events.selectTokenDialogUpdated,
        useCallback(
            (ev: SelectTokenDialogEvent) => {
                if (ev.open || !ev.token || ev.uuid !== id) return
                setToken(ev.token)
            },
            [id],
        ),
    )
    const onSelectTokenChipClick = useCallback(() => {
        if (!token) return
        setSelectTokenDialogOpen({
            open: true,
            uuid: id,
            disableNativeToken: true,
            FixedTokenListProps: {
                selectedTokens: [token.address],
                whitelist: [token.address],
            },
        })
    }, [id, token?.address])
    //#endregion

    //#region amount
    const [rawAmount, setRawAmount] = useState('')
    const amount = new BigNumber(rawAmount || '0').multipliedBy(pow10(token?.decimals ?? 0))
    const {
        value: tokenBalance = '0',
        loading: loadingTokenBalance,
        retry: retryLoadTokenBalance,
    } = useTokenBalance(token?.type ?? EthereumTokenType.Native, token?.address ?? '')
    //#endregion

    useEffect(() => {
        setOdds(
            pool
                ? calculateOdds(
                      Number.parseFloat(rawAmount),
                      Number.parseFloat(pool.tokens.ticket.totalSupply),
                      Number.parseInt(pool.config.numberOfWinners, 10),
                  )
                : undefined,
        )
    }, [rawAmount])

    //#region blocking
    const [depositState, depositCallback, resetDepositCallback] = useDepositCallback(
        pool?.prizePool.address ?? '',
        amount.toFixed(),
        pool?.tokens.ticket.address ?? '',
        ADDRESS_ZERO, // TODO: accoriding to reference at this time: https://github.com/pooltogether/pooltogether-community-ui/blob/a827bf7932eb6cd7870df99da66d0843abcf727d/lib/components/DepositUI.jsx#L25
        token,
    )
    //#endregion

    //#region Swap
    const { setDialog: openSwapDialog } = useRemoteControlledDialog(
        PluginTraderMessages.events.swapDialogUpdated,
        useCallback(
            (ev) => {
                if (!ev.open) {
                    retryLoadTokenBalance()
                }
            },
            [retryLoadTokenBalance],
        ),
    )
    const openSwap = useCallback(() => {
        if (!token) return
        openSwapDialog({
            open: true,
            traderProps: {
                coin: {
                    id: token.address,
                    name: token.name ?? '',
                    symbol: token.symbol ?? '',
                    contract_address: token.address,
                    decimals: token.decimals,
                } as Coin,
            },
        })
    }, [token, openSwapDialog])
    //#endregion

    //#region transaction dialog
    const cashTag = isTwitter(activatedSocialNetworkUI) ? '$' : ''
    const shareLink = activatedSocialNetworkUI.utils
        .getShareLinkURL?.(
            token
                ? t('plugin_pooltogether_share', {
                      amount: formatBalance(amount, 6),
                      cashTag: cashTag,
                      symbol: token.symbol,
                      pool: pool?.name,
                  })
                : '',
        )
        .toString()

    // on close transaction dialog
    const { setDialog: setTransactionDialogOpen } = useRemoteControlledDialog(
        WalletMessages.events.transactionDialogUpdated,
        useCallback(
            (ev) => {
                if (!ev.open) {
                    retryLoadTokenBalance()
                    openSwapDialog({ open: false })
                    if (depositState.type === TransactionStateType.HASH) onClose()
                }
                if (depositState.type === TransactionStateType.HASH) setRawAmount('')
                resetDepositCallback()
            },
            [id, depositState, openSwapDialog, retryLoadTokenBalance, retryLoadTokenBalance, onClose],
        ),
    )

    // open the transaction dialog
    useEffect(() => {
        if (!token || !pool) return
        if (depositState.type === TransactionStateType.UNKNOWN) return
        setTransactionDialogOpen({
            open: true,
            shareLink,
            state: depositState,
            summary: `Depositing ${formatBalance(amount, token.decimals)}${token.symbol} on ${pool?.name} pool.`,
        })
    }, [depositState /* update tx dialog only if state changed */])
    //#endregion

    //#region submit button
    const validationMessage = useMemo(() => {
        if (!account) return t('plugin_wallet_connect_a_wallet')
        if (!amount || amount.isZero()) return t('plugin_pooltogether_enter_an_amount')
        if (amount.isGreaterThan(tokenBalance))
            return t('plugin_pooltogether_insufficient_balance', {
                symbol: token?.symbol,
            })
        return ''
    }, [account, amount.toFixed(), token, tokenBalance])
    //#endregion

    if (!token || !pool) return null

    return (
        <div className={classes.root}>
            <InjectedDialog
                open={open}
                onClose={onClose}
                title={t('plugin_pooltogether_deposit_title', { token: token.symbol })}
                maxWidth="xs">
                <DialogContent>
                    <form className={classes.form} noValidate autoComplete="off">
                        <TokenAmountPanel
                            label="Amount"
                            amount={rawAmount}
                            balance={tokenBalance ?? '0'}
                            token={token}
                            onAmountChange={setRawAmount}
                            SelectTokenChip={{
                                loading: loadingTokenBalance,
                                ChipProps: {
                                    onClick: onSelectTokenChipClick,
                                },
                            }}
                        />
                    </form>
                    {isZero(tokenBalance) ? (
                        <ActionButton
                            className={classes.button}
                            fullWidth
                            onClick={openSwap}
                            variant="contained"
                            loading={loadingTokenBalance}>
                            {t('plugin_pooltogether_buy', { symbol: token.symbol })}
                        </ActionButton>
                    ) : (
                        <EthereumWalletConnectedBoundary>
                            <EthereumERC20TokenApprovedBoundary
                                amount={amount.toFixed()}
                                spender={pool.prizePool.address}
                                token={token?.type === EthereumTokenType.ERC20 ? token : undefined}>
                                <ActionButton
                                    className={classes.button}
                                    fullWidth
                                    disabled={!!validationMessage}
                                    onClick={depositCallback}
                                    variant="contained"
                                    loading={loadingTokenBalance}>
                                    {validationMessage || t('plugin_pooltogether_deposit')}
                                </ActionButton>
                            </EthereumERC20TokenApprovedBoundary>
                        </EthereumWalletConnectedBoundary>
                    )}
                    {odds ? (
                        <Grid container direction="column" className={classes.odds}>
                            <Grid item>
                                <Typography variant="body2" fontWeight="fontWeightBold" className={classes.oddsTitle}>
                                    {t('plugin_pooltogether_odds_title')}
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="body2" fontWeight="fontWeightBold" className={classes.oddsValue}>
                                    {t('plugin_pooltogether_odds_value', { value: odds.toLocaleString() })}
                                </Typography>
                            </Grid>
                        </Grid>
                    ) : null}
                </DialogContent>
            </InjectedDialog>
        </div>
    )
}
