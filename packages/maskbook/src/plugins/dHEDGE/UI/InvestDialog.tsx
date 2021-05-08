import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { makeStyles, createStyles, DialogContent } from '@material-ui/core'
import BigNumber from 'bignumber.js'
import { v4 as uuid } from 'uuid'

import { useI18N } from '../../../utils/i18n-next-ui'
import { EthereumTokenType, EtherTokenDetailed, ERC20TokenDetailed } from '../../../web3/types'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useChainId } from '../../../web3/hooks/useBlockNumber'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { useInvestCallback } from '../hooks/useInvestCallback'
import { TokenAmountPanel } from '../../../web3/UI/TokenAmountPanel'
import { formatBalance } from '../../Wallet/formatter'
import { TransactionStateType } from '../../../web3/hooks/useTransactionState'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { SelectTokenDialogEvent, WalletMessages } from '../../Wallet/messages'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { usePostLink } from '../../../components/DataSource/usePostInfo'
import { activatedSocialNetworkUI } from '../../../social-network'
import { PluginDHedgeMessages } from '../messages'
import { EthereumMessages } from '../../Ethereum/messages'
import { useTokenBalance } from '../../../web3/hooks/useTokenBalance'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import { EthereumERC20TokenApprovedBoundary } from '../../../web3/UI/EthereumERC20TokenApprovedBoundary'
import { isTwitter } from '../../../social-network-adaptor/twitter.com/base'
import { PluginTraderMessages } from '../../Trader/messages'
import type { Pool } from '../types'
import type { Coin } from '../../Trader/types'

const useStyles = makeStyles((theme) =>
    createStyles({
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
            margin: theme.spacing(2, 0),
            padding: 12,
        },
    }),
)

export interface InvestDialogProps extends withClasses<never> {}

export function InvestDialog(props: InvestDialogProps) {
    const { t } = useI18N()
    const classes = useStyles()

    const [id] = useState(uuid())
    const [pool, setPool] = useState<Pool>()
    const [token, setToken] = useState<EtherTokenDetailed | ERC20TokenDetailed>()

    // context
    const account = useAccount()
    const chainId = useChainId()

    //#region remote controlled dialog
    const [open, setInvestingDialogOpen] = useRemoteControlledDialog(
        PluginDHedgeMessages.events.InvestDialogUpdated,
        (ev) => {
            if (ev.open) {
                setPool(ev.pool)
                setToken(ev.token)
            }
        },
    )
    const onClose = useCallback(() => {
        setInvestingDialogOpen({
            open: false,
        })
    }, [setInvestingDialogOpen])
    //#endregion

    //#region select token
    const [, setSelectTokenDialogOpen] = useRemoteControlledDialog(
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
            disableEther: true,
            FixedTokenListProps: {
                selectedTokens: [token.address],
                whitelist: [token.address],
            },
        })
    }, [id, token?.address])
    //#endregion

    //#region amount
    const [rawAmount, setRawAmount] = useState('')
    const amount = new BigNumber(rawAmount || '0').multipliedBy(new BigNumber(10).pow(token?.decimals ?? 0))
    const { value: tokenBalance = '0', loading: loadingTokenBalance, retry: retryLoadTokenBalance } = useTokenBalance(
        token?.type ?? EthereumTokenType.Ether,
        token?.address ?? '',
    )
    //#endregion

    //#region blocking
    const [investState, investCallback, resetInvestCallback] = useInvestCallback(
        pool?.address ?? '',
        amount.toFixed(),
        token,
    )
    //#endregion

    //#region Swap
    const [, openSwapDialog] = useRemoteControlledDialog(
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
                    eth_address: token.address,
                    decimals: token.decimals,
                } as Coin,
            },
        })
    }, [token, openSwapDialog])
    //#endregion

    //#region transaction dialog
    const cashTag = isTwitter(activatedSocialNetworkUI) ? '$' : ''
    const postLink = usePostLink()
    const shareLink = activatedSocialNetworkUI.utils
        .getShareLinkURL?.(
            token
                ? [
                      `I just invested ${formatBalance(amount, 6)} ${cashTag}${token.symbol} in ${
                          pool?.name
                      }. Follow @realMaskbook (mask.io) to invest dHEDGE pools.`,
                      '#mask_io',
                      postLink,
                  ].join('\n')
                : '',
        )
        .toString()

    // on close transaction dialog
    const [_, setTransactionDialogOpen] = useRemoteControlledDialog(
        EthereumMessages.events.transactionDialogUpdated,
        useCallback(
            (ev) => {
                if (!ev.open) {
                    retryLoadTokenBalance()
                    openSwapDialog({ open: false })
                    if (investState.type === TransactionStateType.HASH) onClose()
                }
                if (investState.type === TransactionStateType.HASH) setRawAmount('')
                resetInvestCallback()
            },
            [id, investState, openSwapDialog, retryLoadTokenBalance, retryLoadTokenBalance, onClose],
        ),
    )

    // open the transaction dialog
    useEffect(() => {
        if (!token || !pool) return
        if (investState.type === TransactionStateType.UNKNOWN) return
        setTransactionDialogOpen({
            open: true,
            shareLink,
            state: investState,
            summary: `Investing ${formatBalance(amount, token.decimals)}${token.symbol} on ${pool?.name} pool.`,
        })
    }, [investState /* update tx dialog only if state changed */])
    //#endregion

    //#region submit button
    const validationMessage = useMemo(() => {
        if (!account) return t('plugin_wallet_connect_a_wallet')
        if (!amount || amount.isZero()) return t('plugin_dhedge_enter_an_amount')
        if (amount.isGreaterThan(tokenBalance))
            return t('plugin_dhedge_insufficient_balance', {
                symbol: token?.symbol,
            })
        return ''
    }, [account, amount.toFixed(), token, tokenBalance])
    //#endregion

    if (!token || !pool) return null

    return (
        <div className={classes.root}>
            <InjectedDialog open={open} onClose={onClose} title={pool.name} DialogProps={{ maxWidth: 'xs' }}>
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
                    {tokenBalance === '0' ? (
                        <ActionButton
                            className={classes.button}
                            fullWidth
                            onClick={openSwap}
                            variant="contained"
                            loading={loadingTokenBalance}>
                            {t('plugin_dhedge_buy_token', { symbol: token.symbol })}
                        </ActionButton>
                    ) : (
                        <EthereumWalletConnectedBoundary>
                            <EthereumERC20TokenApprovedBoundary
                                amount={amount.toFixed()}
                                spender={pool.address}
                                token={token?.type === EthereumTokenType.ERC20 ? token : undefined}>
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
                        </EthereumWalletConnectedBoundary>
                    )}
                </DialogContent>
            </InjectedDialog>
        </div>
    )
}
