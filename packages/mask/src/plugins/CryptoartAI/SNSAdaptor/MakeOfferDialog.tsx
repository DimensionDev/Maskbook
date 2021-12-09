import { useState, useCallback, useMemo, useEffect } from 'react'
import { DialogContent, Box, Card, CardContent, CardActions, Link } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { first } from 'lodash-unified'
import BigNumber from 'bignumber.js'
import { FungibleTokenDetailed, isNative, useFungibleTokenWatched, useChainId } from '@masknet/web3-shared-evm'
import { useI18N } from '../../../utils'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { SelectTokenAmountPanel } from '../../ITO/SNSAdaptor/SelectTokenAmountPanel'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import { useRemoteControlledDialog } from '@masknet/shared'
import { WalletMessages } from '../../Wallet/messages'
import type { useAsset } from '../hooks/useAsset'
import { formatBalance, TransactionStateType } from '@masknet/web3-shared-evm'
import { resolvePaymentTokensOnCryptoartAI } from '../pipes'
import { usePlaceBidCallback } from '../hooks/usePlaceBidCallback'
import { resolveAssetLinkOnCryptoartAI } from '../pipes'
import { activatedSocialNetworkUI } from '../../../social-network'
import { isTwitter } from '../../../social-network-adaptor/twitter.com/base'
import { isFacebook } from '../../../social-network-adaptor/facebook.com/base'

const useStyles = makeStyles()((theme) => {
    return {
        content: {
            padding: 0,
        },
        details: {
            color: '#999',
            fontSize: '14px',
            margin: '0px',
        },
        footer: {
            display: 'flex',
            justifyContent: 'flex-end',
            padding: theme.spacing(0, 2, 2),
        },
        panel: {
            marginTop: theme.spacing(2),
            '&:first-child': {
                marginTop: 0,
            },
        },
        label: {},
        buttons: {
            width: '100%',
            margin: `0 ${theme.spacing(-0.5)}`,
        },
        button: {
            flex: 1,
            margin: `${theme.spacing(1.5)} ${theme.spacing(0.5)} 0`,
        },
        markdown: {
            margin: theme.spacing(1, 0),
        },
        mediaContent: {
            display: 'flex',
            justifyContent: 'center',
            height: '200px',
        },
        player: {
            maxWidth: '100%',
            maxHeight: '100%',
            border: 'none',
        },
    }
})

export interface MakeOfferDialogProps {
    asset?: ReturnType<typeof useAsset>
    open: boolean
    onClose: () => void
}

export function MakeOfferDialog(props: MakeOfferDialogProps) {
    const { asset, open, onClose } = props
    const is24Auction = asset?.value?.is24Auction ?? false
    const isVerified = (!asset?.value?.isSoldOut && !asset?.value?.is_owner) ?? false

    const { t } = useI18N()
    const { classes } = useStyles()

    const chainId = useChainId()

    const paymentTokens = resolvePaymentTokensOnCryptoartAI(chainId) ?? []
    const selectedPaymentToken = first(paymentTokens)

    const { amount, token, balance, setAmount, setToken } = useFungibleTokenWatched(selectedPaymentToken)

    const [atLeastBidValue, setAtLeastBidValue] = useState(0)
    useEffect(() => {
        const price = new BigNumber(
            is24Auction ? asset?.value?.latestBidVo?.priceInEth : asset?.value?.trade?.latestBid,
        )
        setAtLeastBidValue(price.isFinite() ? price.plus(price.gte(1) ? '0.1' : '0.01').toNumber() : 0.01)
    }, [asset?.value?.latestBidVo])

    const [placeBidState, placeBidCallback, resetCallback] = usePlaceBidCallback(
        is24Auction,
        asset?.value?.editionNumber ?? '0',
    )

    const onMakeOffer = useCallback(() => {
        placeBidCallback(new BigNumber(amount).shiftedBy(selectedPaymentToken?.decimals ?? 18).toNumber())
    }, [placeBidCallback, amount])

    const assetLink = resolveAssetLinkOnCryptoartAI(asset?.value?.creator?.username, asset?.value?.token_id, chainId)
    const shareLink = activatedSocialNetworkUI.utils
        .getShareLinkURL?.(
            token
                ? t(
                      isTwitter(activatedSocialNetworkUI) || isFacebook(activatedSocialNetworkUI)
                          ? 'plugin_cryptoartai_offer_share'
                          : 'plugin_cryptoartai_offer_share_no_official_account',
                      {
                          amount: amount,
                          symbol: token?.value?.symbol,
                          title: asset?.value?.title,
                          assetLink: assetLink,
                          account: isTwitter(activatedSocialNetworkUI) ? t('twitter_account') : t('facebook_account'),
                      },
                  )
                : '',
        )
        .toString()

    const { setDialog: setTransactionDialog } = useRemoteControlledDialog(
        WalletMessages.events.transactionDialogUpdated,
        useCallback(
            (ev) => {
                if (!ev.open) {
                    if (placeBidState.type === TransactionStateType.HASH) onClose()
                    if (placeBidState.type === TransactionStateType.CONFIRMED) {
                        asset?.retry()
                    }
                }
                resetCallback()
            },
            [placeBidState, onClose],
        ),
    )

    useEffect(() => {
        if (placeBidState.type === TransactionStateType.UNKNOWN) return
        setTransactionDialog({
            open: true,
            shareLink,
            state: placeBidState,
            summary:
                (asset?.value?.is24Auction
                    ? t('plugin_collectible_place_a_bid')
                    : t('plugin_collectible_make_an_offer')) +
                ' ' +
                asset?.value?.title,
        })
    }, [placeBidState])

    useEffect(() => {
        setAmount(atLeastBidValue.toString())
    }, [open])

    const validationMessage = useMemo(() => {
        const amount_ = new BigNumber(amount || '0')
        const balance_ = new BigNumber(balance.value ?? '0')
        if (amount_.isZero()) return t('plugin_collectible_enter_a_price')
        if (amount_.lt(atLeastBidValue)) return t('plugin_collectible_enter_a_price')
        if (balance_.isZero() || amount_.gt(formatBalance(balance.value, token?.value?.decimals, 6)))
            return t('plugin_collectible_insufficient_balance')
        if (
            asset?.value?.is24Auction &&
            new Date(asset.value.latestBidVo?.auctionEndTime).getTime() - Date.now() <= 0
        ) {
            return t('plugin_cryptoartai_auction_end')
        }
        return ''
    }, [amount, balance.value, isVerified, is24Auction])

    if (!asset?.value) return null
    return (
        <InjectedDialog
            title={
                asset?.value?.is24Auction ? t('plugin_collectible_place_a_bid') : t('plugin_collectible_make_an_offer')
            }
            open={open}
            onClose={onClose}>
            <DialogContent className={classes.content}>
                <Card elevation={0}>
                    <CardContent>
                        <Box className={classes.mediaContent}>
                            {asset.value.ossUrl.match(/\.(mp4|avi|webm)$/i) ? (
                                <Link href={asset.value.ossUrl} target="_blank" rel="noopener noreferrer">
                                    <img
                                        className={classes.player}
                                        src={asset.value.shareUrl}
                                        alt={asset.value.title}
                                    />
                                </Link>
                            ) : (
                                <img className={classes.player} src={asset.value.shareUrl} alt={asset.value.title} />
                            )}
                        </Box>
                        <h3>
                            {(asset?.value?.is24Auction
                                ? t('plugin_collectible_place_a_bid')
                                : t('plugin_collectible_make_an_offer')) +
                                ' ' +
                                asset?.value?.title}
                        </h3>
                        <SelectTokenAmountPanel
                            amount={amount}
                            balance={balance.value ?? '0'}
                            token={token.value as FungibleTokenDetailed}
                            disableNativeToken={!paymentTokens.some((x: any) => isNative(x.address))}
                            onAmountChange={setAmount}
                            onTokenChange={setToken}
                            TokenAmountPanelProps={{
                                label: t('plugin_collectible_price'),
                            }}
                            FixedTokenListProps={{
                                selectedTokens: selectedPaymentToken ? [selectedPaymentToken.address] : [],
                                tokens: paymentTokens,
                                whitelist: paymentTokens.map((x: any) => x.address),
                            }}
                        />
                        <p className={classes.details} style={{ marginTop: '10px' }}>
                            {t('plugin_cryptoartai_current_highest_offer')}
                            <strong style={{ fontSize: '18px' }}>
                                {(is24Auction
                                    ? asset?.value?.latestBidVo?.priceInEth
                                    : asset?.value?.trade?.latestBid) + ' ETH'}
                            </strong>
                        </p>
                        <p className={classes.details}>
                            {t('plugin_cryptoartai_bid_least') + atLeastBidValue + ' ETH'}
                        </p>
                        <p className={classes.details}>{t('plugin_cryptoartai_escrowed')}</p>
                        <p className={classes.details}>
                            {t('plugin_cryptoartai_current_balance_is') +
                                formatBalance(balance.value, token?.value?.decimals, 6) +
                                ' ETH'}
                        </p>
                        {asset?.value?.is24Auction ? (
                            <p className={classes.details}>
                                {t('plugin_cryptoartai_auction_end_time')}
                                <strong>{asset.value.latestBidVo?.auctionEndTime}</strong>
                            </p>
                        ) : null}
                    </CardContent>
                    <CardActions className={classes.footer}>
                        <EthereumWalletConnectedBoundary>
                            <Box className={classes.buttons} display="flex" alignItems="center" justifyContent="center">
                                <ActionButton
                                    className={classes.button}
                                    variant="contained"
                                    disabled={!!validationMessage}
                                    fullWidth
                                    onClick={onMakeOffer}>
                                    {validationMessage ||
                                        t(
                                            is24Auction
                                                ? 'plugin_collectible_place_bid'
                                                : 'plugin_collectible_make_offer',
                                        )}
                                </ActionButton>
                            </Box>
                        </EthereumWalletConnectedBoundary>
                    </CardActions>
                </Card>
            </DialogContent>
        </InjectedDialog>
    )
}
