import { InjectedDialog, useOpenShareTxDialog, useSelectFungibleToken } from '@masknet/shared'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { keyframes, makeStyles } from '@masknet/theme'
import { FungibleToken, isZero, NetworkPluginID, rightShift } from '@masknet/web3-shared-base'
import { ChainId, SchemaType, ZERO_ADDRESS } from '@masknet/web3-shared-evm'
import { DialogContent, Grid, Typography } from '@mui/material'
import { useCallback, useEffect, useMemo, useState } from 'react'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { activatedSocialNetworkUI } from '../../../social-network'
import { isFacebook } from '../../../social-network-adaptor/facebook.com/base'
import { isTwitter } from '../../../social-network-adaptor/twitter.com/base'
import { useI18N } from '../../../utils/i18n-next-ui'
import { EthereumERC20TokenApprovedBoundary } from '../../../web3/UI/EthereumERC20TokenApprovedBoundary'
import { WalletConnectedBoundary } from '../../../web3/UI/WalletConnectedBoundary'
import { TokenAmountPanel } from '../../../web3/UI/TokenAmountPanel'
import { PluginTraderMessages } from '../../Trader/messages'
import type { Coin } from '../../Trader/types'
import { useDepositCallback } from '../hooks/useDepositCallback'
import { PluginPoolTogetherMessages } from '../messages'
import type { Pool } from '../types'
import { calculateOdds, getPrizePeriod } from '../utils'
import { useAccount, useFungibleTokenBalance } from '@masknet/plugin-infra/web3'

const rainbow_animation = keyframes`
    0% {
        background-position: 100% 0%;
    }
    100% {
        background-position: 0 100%;
    }
`

const useStyles = makeStyles()((theme) => ({
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
        webkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        animation: `${rainbow_animation} 6s linear infinite`,
        backgroundSize: '600% 600%',
        fontSize: '1.2rem',
    },
}))

export function DepositDialog() {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [pool, setPool] = useState<Pool>()
    const [token, setToken] = useState<FungibleToken<ChainId, SchemaType>>()
    const [odds, setOdds] = useState<string>()

    // context
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)

    // #region remote controlled dialog
    const { open, closeDialog: onClose } = useRemoteControlledDialog(
        PluginPoolTogetherMessages.DepositDialogUpdated,
        (ev) => {
            if (!ev.open) return
            setPool(ev.pool)
            setToken(ev.token)
        },
    )
    // #endregion

    // #region select token
    const selectFungibleToken = useSelectFungibleToken(NetworkPluginID.PLUGIN_EVM)
    const onSelectTokenChipClick = useCallback(async () => {
        if (!token) return
        const picked = await selectFungibleToken({
            disableNativeToken: true,
            selectedTokens: [token.address],
            whitelist: [token.address],
        })
        if (picked) setToken(picked)
    }, [token, selectFungibleToken])
    // #endregion

    // #region amount
    const [rawAmount, setRawAmount] = useState('')
    const amount = rightShift(rawAmount || '0', token?.decimals)
    const {
        value: tokenBalance = '0',
        loading: loadingTokenBalance,
        retry: retryLoadTokenBalance,
    } = useFungibleTokenBalance(NetworkPluginID.PLUGIN_EVM, token?.address ?? '')
    // #endregion

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
    }, [pool, rawAmount])

    // #region blocking
    const [{ loading: isDepositing }, depositCallback] = useDepositCallback(
        pool?.prizePool.address ?? '',
        amount.toFixed(),
        pool?.tokens.ticket.address ?? '',
        ZERO_ADDRESS, // TODO: according to reference at 18 Jul 2021: https://github.com/pooltogether/pooltogether-community-ui/blob/a827bf79/lib/components/DepositUI.jsx#L25
        token,
    )
    // #endregion

    const cashTag = isTwitter(activatedSocialNetworkUI) ? '$' : ''
    const shareText = token
        ? t(
              isTwitter(activatedSocialNetworkUI) || isFacebook(activatedSocialNetworkUI)
                  ? 'plugin_pooltogether_share'
                  : 'plugin_pooltogether_share_no_official_account',
              {
                  amount: rawAmount,
                  cashTag,
                  symbol: token.symbol,
                  pool: pool?.name ?? `${pool?.tokens.underlyingToken.symbol} Pool`,
                  account: isTwitter(activatedSocialNetworkUI) ? t('twitter_account') : t('facebook_account'),
              },
          )
        : ''

    const openShareTxDialog = useOpenShareTxDialog()
    const deposit = useCallback(async () => {
        const hash = await depositCallback()
        if (typeof hash === 'string') {
            await openShareTxDialog({
                hash,
                onShare() {
                    activatedSocialNetworkUI.utils.share?.(shareText)
                },
            })
            setRawAmount('')
        }
        retryLoadTokenBalance()
    }, [depositCallback, retryLoadTokenBalance, openShareTxDialog])

    // #region Swap
    const { setDialog: openSwapDialog } = useRemoteControlledDialog(
        PluginTraderMessages.swapDialogUpdated,
        useCallback(
            (ev: { open: boolean }) => {
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
    // #endregion

    // #region submit button
    const validationMessage = useMemo(() => {
        if (!account) return t('plugin_wallet_connect_a_wallet')
        if (!amount || amount.isZero()) return t('plugin_pooltogether_enter_an_amount')
        if (amount.isGreaterThan(tokenBalance))
            return t('plugin_pooltogether_insufficient_balance', {
                symbol: token?.symbol,
            })
        return ''
    }, [account, amount.toFixed(), token, tokenBalance])
    // #endregion

    const prizePeriodSeconds = Number.parseInt(pool?.config.prizePeriodSeconds ?? '', 10)

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
                    <WalletConnectedBoundary>
                        {isZero(tokenBalance) ? (
                            <ActionButton
                                className={classes.button}
                                fullWidth
                                onClick={openSwap}
                                disabled={isDepositing}
                                loading={loadingTokenBalance || isDepositing}>
                                {t('plugin_pooltogether_buy', { symbol: token.symbol })}
                            </ActionButton>
                        ) : (
                            <EthereumERC20TokenApprovedBoundary
                                amount={amount.toFixed()}
                                spender={pool.prizePool.address}
                                token={token?.schema === SchemaType.ERC20 ? token : undefined}>
                                <ActionButton
                                    className={classes.button}
                                    fullWidth
                                    disabled={!!validationMessage || isDepositing}
                                    onClick={deposit}
                                    loading={loadingTokenBalance || isDepositing}>
                                    {validationMessage || t('plugin_pooltogether_deposit_msg')}
                                </ActionButton>
                            </EthereumERC20TokenApprovedBoundary>
                        )}
                    </WalletConnectedBoundary>
                    {odds ? (
                        <Grid container direction="column" className={classes.odds}>
                            <Grid item>
                                <Typography variant="body2" fontWeight="fontWeightBold" className={classes.oddsTitle}>
                                    {t('plugin_pooltogether_odds_title')}
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="body2" fontWeight="fontWeightBold" className={classes.oddsValue}>
                                    {t('plugin_pooltogether_odds_value', {
                                        value: Number.parseFloat(odds).toFixed(4),
                                        period: getPrizePeriod(t, prizePeriodSeconds),
                                    })}
                                </Typography>
                            </Grid>
                        </Grid>
                    ) : null}
                </DialogContent>
            </InjectedDialog>
        </div>
    )
}
