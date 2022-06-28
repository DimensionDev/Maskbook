import { useEffect, useMemo, useState, useCallback } from 'react'
import { InjectedDialog, NFTCardStyledAssetPlayer, useOpenShareTxDialog } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { first } from 'lodash-unified'
import BigNumber from 'bignumber.js'
import { isNativeTokenAddress } from '@masknet/web3-shared-evm'
import { Box, Card, CardActions, CardContent, DialogContent, Link } from '@mui/material'
import { useI18N } from '../../../utils'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { SelectTokenAmountPanel } from '../../ITO/SNSAdaptor/SelectTokenAmountPanel'
import { WalletConnectedBoundary } from '../../../web3/UI/WalletConnectedBoundary'
import type { useAsset } from '../hooks/useAsset'
import { usePlaceBidCallback } from '../hooks/usePlaceBidCallback'
import { activatedSocialNetworkUI } from '../../../social-network'
import { isTwitter } from '../../../social-network-adaptor/twitter.com/base'
import { isFacebook } from '../../../social-network-adaptor/facebook.com/base'
import { formatBalance, NetworkPluginID } from '@masknet/web3-shared-base'
import { useChainId, useFungibleTokenWatched } from '@masknet/plugin-infra/web3'
import { resolveAssetLinkOnCryptoartAI, resolvePaymentTokensOnCryptoartAI } from '../pipes'

const useStyles = makeStyles()((theme) => {
    return {
        content: {
            padding: 0,
        },
        details: {
            color: '#999',
            fontSize: '14px',
            margin: 0,
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
    const { t } = useI18N()
    const { classes } = useStyles()
    const { asset, open, onClose } = props

    const assetSource = useMemo(() => {
        if (!asset || !asset.value || asset.error) return
        return asset.value
    }, [asset?.value])

    const is24Auction = assetSource?.is24Auction ?? false
    const isVerified = (!assetSource?.isSoldOut && !assetSource?.is_owner) ?? false

    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)

    const paymentTokens = resolvePaymentTokensOnCryptoartAI(chainId) ?? []
    const selectedPaymentToken = first(paymentTokens)

    const { amount, token, balance, setAmount, setAddress } = useFungibleTokenWatched(
        NetworkPluginID.PLUGIN_EVM,
        selectedPaymentToken?.address,
    )

    const [atLeastBidValue, setAtLeastBidValue] = useState(0)
    useEffect(() => {
        const price = new BigNumber(is24Auction ? assetSource?.latestBidVo?.priceInEth : assetSource?.trade?.latestBid)
        setAtLeastBidValue(price.isFinite() ? price.plus(price.gte(1) ? '0.1' : '0.01').toNumber() : 0.01)
    }, [assetSource?.latestBidVo])

    const [{ loading: isPlacingBid }, placeBidCallback] = usePlaceBidCallback(
        is24Auction,
        assetSource?.editionNumber ?? '0',
    )

    const assetLink = resolveAssetLinkOnCryptoartAI(assetSource?.creator?.username, assetSource?.token_id, chainId)
    const shareText = token
        ? t(
              isTwitter(activatedSocialNetworkUI) || isFacebook(activatedSocialNetworkUI)
                  ? 'plugin_cryptoartai_offer_share'
                  : 'plugin_cryptoartai_offer_share_no_official_account',
              {
                  amount,
                  symbol: token?.value?.symbol,
                  title: assetSource?.title,
                  assetLink,
                  account: isTwitter(activatedSocialNetworkUI) ? t('twitter_account') : t('facebook_account'),
              },
          )
        : ''
    const openShareTxDialog = useOpenShareTxDialog()
    const onMakeOffer = useCallback(async () => {
        const hash = await placeBidCallback(
            new BigNumber(amount).shiftedBy(selectedPaymentToken?.decimals ?? 18).toNumber(),
        )
        if (typeof hash !== 'string') return
        await openShareTxDialog({
            hash,
            onShare() {
                activatedSocialNetworkUI.utils.share?.(shareText)
            },
        })
        asset?.retry()
    }, [placeBidCallback, amount, asset?.retry, openShareTxDialog])

    useEffect(() => {
        setAmount(atLeastBidValue.toString())
    }, [open])

    const validationMessage = useMemo(() => {
        const amount_ = new BigNumber(amount || '0')
        const balance_ = new BigNumber(balance.value ?? '0')
        if (amount_.isZero()) return t('plugin_collectible_enter_a_price')
        if (amount_.lt(atLeastBidValue)) return t('plugin_collectible_enter_a_price')
        if (balance_.isZero() || amount_.gt(formatBalance(balance.value, token?.value?.decimals, 4)))
            return t('plugin_collectible_insufficient_balance')
        if (
            assetSource?.is24Auction &&
            new Date(assetSource?.latestBidVo?.auctionEndTime).getTime() - Date.now() <= 0
        ) {
            return t('plugin_cryptoartai_auction_end')
        }
        return ''
    }, [amount, balance.value, isVerified, is24Auction])

    if (!asset || !asset.value) return null

    return (
        <InjectedDialog
            title={
                assetSource?.is24Auction ? t('plugin_collectible_place_a_bid') : t('plugin_collectible_make_an_offer')
            }
            open={open}
            onClose={onClose}>
            <DialogContent className={classes.content}>
                <Card elevation={0}>
                    <CardContent>
                        <Box className={classes.mediaContent}>
                            {assetSource?.ossUrl.match(/\.(mp4|avi|webm)$/i) ? (
                                <Link href={assetSource?.ossUrl} target="_blank" rel="noopener noreferrer">
                                    <NFTCardStyledAssetPlayer url={assetSource.ossUrl || assetSource.shareUrl} />
                                </Link>
                            ) : (
                                <img
                                    className={classes.player}
                                    src={assetSource?.ossUrl || assetSource?.shareUrl}
                                    alt={assetSource?.title}
                                />
                            )}
                        </Box>
                        <h3>
                            {(assetSource?.is24Auction
                                ? t('plugin_collectible_place_a_bid')
                                : t('plugin_collectible_make_an_offer')) +
                                ' ' +
                                assetSource?.title}
                        </h3>
                        <SelectTokenAmountPanel
                            amount={amount}
                            balance={balance.value ?? '0'}
                            token={token.value}
                            disableNativeToken={!paymentTokens.some(isNativeTokenAddress)}
                            onAmountChange={setAmount}
                            onTokenChange={(x) => setAddress(x.address)}
                            TokenAmountPanelProps={{
                                label: t('plugin_collectible_price'),
                            }}
                            FungibleTokenListProps={{
                                selectedTokens: selectedPaymentToken ? [selectedPaymentToken.address] : [],
                                tokens: paymentTokens,
                                whitelist: paymentTokens.map((x: any) => x.address),
                            }}
                        />
                        <p className={classes.details} style={{ marginTop: '10px' }}>
                            {t('plugin_cryptoartai_current_highest_offer')}
                            <strong style={{ fontSize: '18px' }}>
                                {(is24Auction ? assetSource?.latestBidVo?.priceInEth : assetSource?.trade?.latestBid) +
                                    ' ETH'}
                            </strong>
                        </p>
                        <p className={classes.details}>
                            {t('plugin_cryptoartai_bid_least') + atLeastBidValue + ' ETH'}
                        </p>
                        <p className={classes.details}>{t('plugin_cryptoartai_escrowed')}</p>
                        <p className={classes.details}>
                            {t('plugin_cryptoartai_current_balance_is') +
                                formatBalance(balance.value, token?.value?.decimals, 4) +
                                ' ETH'}
                        </p>
                        {assetSource?.is24Auction ? (
                            <p className={classes.details}>
                                {t('plugin_cryptoartai_auction_end_time')}
                                <strong>{assetSource?.latestBidVo?.auctionEndTime}</strong>
                            </p>
                        ) : null}
                    </CardContent>
                    <CardActions className={classes.footer}>
                        <WalletConnectedBoundary>
                            <Box className={classes.buttons} display="flex" alignItems="center" justifyContent="center">
                                <ActionButton
                                    loading={isPlacingBid}
                                    className={classes.button}
                                    disabled={!!validationMessage || isPlacingBid}
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
                        </WalletConnectedBoundary>
                    </CardActions>
                </Card>
            </DialogContent>
        </InjectedDialog>
    )
}
