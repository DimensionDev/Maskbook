import React, { useState, useEffect, useMemo } from 'react'
import { Grid } from '@material-ui/core'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import BigNumber from 'bignumber.js'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import { TokenAmountPanel } from '../../../web3/UI/TokenAmountPanel'
import {
    EthereumTokenType,
    useAccount,
    TransactionStateType,
    FungibleTokenDetailed,
    ChainId,
    useChainId,
    formatBalance,
    pow10,
    useNativeTokenDetailed,
    useFungibleTokenBalance,
} from '@masknet/web3-shared'
import { useRemoteControlledDialog, useStylesExtends } from '@masknet/shared'
import { useI18N } from '../../../utils'
import { makeStyles } from '@masknet/theme'
import FoudationCountdown from './FoudationCountdown'
import type { Nft, Metadata } from '../types'
import { WalletMessages } from '../../Wallet/messages'
import { usePlaceBidCallback } from '../hooks/usePlaceBidCallback'
import { activatedSocialNetworkUI } from '../../../social-network'
import { isTwitter } from '../../../social-network-adaptor/twitter.com/base'

const useStyles = makeStyles()((theme) => {
    return {
        form: {
            '& > *': {
                margin: theme.spacing(1, 0),
            },
            width: '100%',
        },
        button: {
            width: '100%',
        },
    }
})

interface Props extends withClasses<never> {
    nft: Nft
    metadata: Metadata
    chainId: ChainId
    link: string
}

function FoundationPlaceBid(props: Props) {
    //#region context
    const { t } = useI18N()
    const account = useAccount()
    const chainId = useChainId()
    const nativeTokenDetailed = useNativeTokenDetailed()
    const classes = useStylesExtends(useStyles(), props)
    const auctionId = props.nft.mostRecentAuction.id.split('-')[1]
    //#endregion

    //#region the selected token
    const [token = nativeTokenDetailed.value] = useState<FungibleTokenDetailed | undefined>(nativeTokenDetailed.value)
    const tokenBalance = useFungibleTokenBalance(token?.type ?? EthereumTokenType.Native, token?.address ?? '')
    //#endregion

    //#region amount
    const [rawAmount, setRawAmount] = useState('')
    const amount = new BigNumber(rawAmount || '0').multipliedBy(pow10(18))
    //#endregion

    //#region blocking
    const [placeBidState, PlaceBidCallback, resetCallback] = usePlaceBidCallback(auctionId, amount.toFixed())
    //#endregion

    //#region transaction dialog
    const cashTag = isTwitter(activatedSocialNetworkUI) ? '$' : ''
    const shareLink = activatedSocialNetworkUI.utils
        .getShareLinkURL?.(
            token
                ? [
                      t('plugin_foundation_sharelink', {
                          link: props.link,
                          amount: formatBalance(amount, token.decimals),
                          cashTag: cashTag,
                          symbol: token.symbol,
                      }),
                      '#mask_io',
                  ].join('\n')
                : '',
        )
        .toString()

    // close the transaction dialog
    const { setDialog: setTransactionDialog } = useRemoteControlledDialog(
        WalletMessages.events.transactionDialogUpdated,
        (ev) => {
            if (ev.open) return
            if (placeBidState.type === TransactionStateType.HASH) setRawAmount('')
            resetCallback()
        },
    )

    // open the transaction dialog
    useEffect(() => {
        if (!token) return
        if (placeBidState.type === TransactionStateType.UNKNOWN) return
        setTransactionDialog({
            open: true,
            shareLink,
            state: placeBidState,
            summary: t('plugin_foundation_open_dialog', {
                amount: formatBalance(amount, token.decimals),
                symbol: token.symbol,
                name: props.metadata.name,
            }),
        })
    }, [placeBidState /* update tx dialog only if state changed */])
    //#endregion

    //#region submit button
    const validationMessage = useMemo(() => {
        if (props.nft.mostRecentAuction.status !== 'Open') return t('plugin_foundation_auction_over')
        if (props.nft.mostRecentAuction.highestBid?.bidder.id.includes(account.toLocaleLowerCase()))
            return t('plugin_foundation_you_outstanding_bid')
        if (props.nft.mostRecentAuction.reservePriceInETH > rawAmount) return t('plugin_foundation_bid_least_reserve')
        if (!token) return t('plugin_foundation_select_a_token')
        if (!account) return t('plugin_wallet_connect_a_wallet')
        if (!auctionId || amount.isZero()) return t('plugin_foundation_enter_an_amount')
        if (amount.isGreaterThan(tokenBalance.value ?? '0'))
            return t('plugin_foundation_insufficient_balance', {
                symbol: token.symbol,
            })
        return ''
    }, [account, amount.toFixed(), chainId, token, tokenBalance.value ?? '0'])
    //#endregion
    if (!auctionId) return null

    return (
        <Grid item xs={12}>
            <EthereumWalletConnectedBoundary offChain={true}>
                <FoudationCountdown dateEnding={props.nft.mostRecentAuction.dateEnding} />
                {props.nft.mostRecentAuction.status === 'Open' && (
                    <form className={classes.form} noValidate autoComplete="off">
                        <TokenAmountPanel
                            label="Amount"
                            amount={rawAmount}
                            balance={tokenBalance.value ?? '0'}
                            token={token}
                            onAmountChange={setRawAmount}
                            SelectTokenChip={{
                                loading: tokenBalance.loading,
                            }}
                        />
                    </form>
                )}
                <ActionButton
                    fullWidth
                    size="large"
                    disabled={!!validationMessage}
                    onClick={PlaceBidCallback}
                    variant="contained">
                    {validationMessage || t('plugin_foundation_place_bid')}
                </ActionButton>
            </EthereumWalletConnectedBoundary>
        </Grid>
    )
}

export default FoundationPlaceBid
