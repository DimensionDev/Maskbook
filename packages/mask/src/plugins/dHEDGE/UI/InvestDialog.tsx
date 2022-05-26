import { InjectedDialog, useOpenShareTxDialog, usePickToken } from '@masknet/shared'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { makeStyles } from '@masknet/theme'
import { useAccount, useFungibleTokenBalance } from '@masknet/plugin-infra/web3'
import { formatBalance, FungibleToken, isZero, NetworkPluginID, rightShift } from '@masknet/web3-shared-base'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { DialogContent } from '@mui/material'
import { useCallback, useMemo, useState } from 'react'
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
import { useInvestCallback } from '../hooks/useInvestCallback'
import { PluginDHedgeMessages } from '../messages'
import type { Pool } from '../types'

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
    const [isInvesting, investCallback] = useInvestCallback(pool, amount.toFixed(), token)
    const openShareTxDialog = useOpenShareTxDialog()
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
    const invest = useCallback(async () => {
        const hash = await investCallback()
        if (typeof hash !== 'string') return
        await openShareTxDialog({
            hash,
            onShare() {
                activatedSocialNetworkUI.utils.share?.(shareText)
            },
        })
        retryLoadTokenBalance()
        onClose()
    }, [investCallback, openShareTxDialog, onClose])
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

    // on close transaction dialog

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
                                disabled={isInvesting}
                                loading={loadingTokenBalance || isInvesting}>
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
                                    disabled={!!validationMessage || isInvesting}
                                    onClick={invest}
                                    variant="contained"
                                    loading={loadingTokenBalance || isInvesting}>
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
