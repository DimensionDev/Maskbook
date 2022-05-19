import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { usePickToken, InjectedDialog } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { formatBalance, FungibleToken, isZero, NetworkPluginID, rightShift } from '@masknet/web3-shared-base'
import { ChainId, SchemaType, TransactionStateType } from '@masknet/web3-shared-evm'
import { DialogContent } from '@mui/material'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { v4 as uuid } from 'uuid'
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
import { WalletMessages } from '../../Wallet/messages'
import { useInvestCallback } from '../hooks/useInvestCallback'
import { PluginDHedgeMessages } from '../messages'
import type { Pool } from '../types'
import { useAccount, useFungibleTokenBalance } from '@masknet/plugin-infra/web3'

const useStyles = makeStyles()((theme) => ({
    paper: {
        width: '450px !important',
    },
    form: {
        '& > *': {
            margin: theme.spacing(1, 0),
        },
    },
    root: {
        margin: theme.spacing(2, 0),
    },
    tip: {
        fontSize: 12,
        color: theme.palette.text.secondary,
        padding: theme.spacing(2, 2, 0, 2),
    },
    button: {
        margin: theme.spacing(1.5, 0, 0),
        padding: 12,
    },
}))

export function InvestDialog() {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [id] = useState(uuid)
    const [pool, setPool] = useState<Pool>()
    const [token, setToken] = useState<FungibleToken<ChainId, SchemaType>>()
    const [allowedTokens, setAllowedTokens] = useState<string[]>()

    // context
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)

    // #region remote controlled dialog
    const { open, closeDialog } = useRemoteControlledDialog(PluginDHedgeMessages.InvestDialogUpdated, (ev) => {
        if (!ev.open) return
        setPool(ev.pool)
        setAllowedTokens(ev.tokens)
    })
    const onClose = useCallback(() => {
        setPool(undefined)
        setAllowedTokens([])
        setToken(undefined)
        closeDialog()
    }, [closeDialog])
    // #endregion

    // #region select token
    const pickToken = usePickToken()
    const onSelectTokenChipClick = useCallback(async () => {
        const picked = await pickToken({
            disableNativeToken: true,
            whitelist: allowedTokens,
        })
        if (picked) setToken(picked)
    }, [pickToken, token?.address, allowedTokens])
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

    // #region blocking
    const [investState, investCallback, resetInvestCallback] = useInvestCallback(pool, amount.toFixed(), token)
    // #endregion

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

    // #region transaction dialog
    const cashTag = isTwitter(activatedSocialNetworkUI) ? '$' : ''
    const shareText = token
        ? [
              `I just invested ${formatBalance(amount, token.decimals)} ${cashTag}${token.symbol} in ${pool?.name}. ${
                  isTwitter(activatedSocialNetworkUI) || isFacebook(activatedSocialNetworkUI)
                      ? `Follow @${
                            isTwitter(activatedSocialNetworkUI) ? t('twitter_account') : t('facebook_account')
                        } (mask.io) to invest dHEDGE pools.`
                      : ''
              }`,
              '#mask_io',
          ].join('\n')
        : ''

    // on close transaction dialog
    const { setDialog: setTransactionDialogOpen } = useRemoteControlledDialog(
        WalletMessages.events.transactionDialogUpdated,
        useCallback(
            (ev: { open: boolean }) => {
                if (!ev.open) {
                    retryLoadTokenBalance()
                    if (investState.type === TransactionStateType.HASH) onClose()
                }
                if (investState.type === TransactionStateType.HASH) setRawAmount('')
                resetInvestCallback()
            },
            [id, investState, retryLoadTokenBalance, retryLoadTokenBalance, onClose],
        ),
    )

    // open the transaction dialog
    useEffect(() => {
        if (!token || !pool) return
        if (investState.type === TransactionStateType.UNKNOWN) return
        setTransactionDialogOpen({
            open: true,
            shareText,
            state: investState,
            summary: `Investing ${formatBalance(amount, token.decimals)}${token.symbol} on ${pool?.name} pool.`,
        })
    }, [investState /* update tx dialog only if state changed */])
    // #endregion

    // #region submit button
    const validationMessage = useMemo(() => {
        if (!account) return t('plugin_wallet_connect_a_wallet')
        if (!amount || amount.isZero()) return t('plugin_dhedge_enter_an_amount')
        if (amount.isGreaterThan(tokenBalance))
            return t('plugin_dhedge_insufficient_balance', {
                symbol: token?.symbol,
            })
        return ''
    }, [account, amount.toFixed(), token, tokenBalance])
    // #endregion

    if (!pool) return null
    return (
        <div className={classes.root}>
            <InjectedDialog open={open} onClose={onClose} title={pool.name} maxWidth="xs">
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
                                variant="contained"
                                loading={loadingTokenBalance}>
                                {t('plugin_dhedge_buy_token', { symbol: token?.symbol })}
                            </ActionButton>
                        ) : (
                            <EthereumERC20TokenApprovedBoundary
                                amount={amount.toFixed()}
                                spender={pool.address}
                                token={token?.schema === SchemaType.ERC20 ? token : undefined}>
                                <ActionButton
                                    className={classes.button}
                                    fullWidth
                                    disabled={!!validationMessage}
                                    onClick={investCallback}
                                    variant="contained"
                                    loading={loadingTokenBalance}>
                                    {validationMessage || t('plugin_dhedge_invest')}
                                </ActionButton>
                            </EthereumERC20TokenApprovedBoundary>
                        )}
                    </WalletConnectedBoundary>
                </DialogContent>
            </InjectedDialog>
        </div>
    )
}
