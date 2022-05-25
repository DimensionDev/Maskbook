import { InjectedDialog, useOpenShareTxDialog } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { formatBalance, useChainId, useFungibleTokenWatched } from '@masknet/web3-shared-evm'
import { Box, Card, CardActions, CardContent, DialogContent, Link, Typography } from '@mui/material'
import BigNumber from 'bignumber.js'
import { first } from 'lodash-unified'
import { useCallback, useMemo } from 'react'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { activatedSocialNetworkUI } from '../../../social-network'
import { isFacebook } from '../../../social-network-adaptor/facebook.com/base'
import { isTwitter } from '../../../social-network-adaptor/twitter.com/base'
import { useI18N } from '../../../utils'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import type { useAsset } from '../hooks/useAsset'
import { usePurchaseCallback } from '../hooks/usePurchaseCallback'
import { resolveAssetLinkOnCryptoartAI, resolvePaymentTokensOnCryptoartAI } from '../pipes'

const useStyles = makeStyles()((theme) => {
    return {
        content: {
            padding: 0,
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
        container: {
            padding: theme.spacing(1),
        },
        chain_row: {
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: theme.spacing(0.5),
            '&:last-child': {
                marginBottom: 0,
            },
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

export interface CheckoutDialogProps {
    asset?: ReturnType<typeof useAsset>
    open: boolean
    onClose: () => void
}

export function CheckoutDialog(props: CheckoutDialogProps) {
    const { asset, open, onClose } = props
    const isVerified =
        (!asset?.value?.isSoldOut &&
            asset?.value?.totalSurplus > 0 &&
            !asset?.value?.is24Auction &&
            asset?.value?.priceInEth < 100000 &&
            asset?.value?.trade?.isCanBuy) ??
        false

    const { t } = useI18N()
    const { classes } = useStyles()

    const chainId = useChainId()

    const paymentTokens = resolvePaymentTokensOnCryptoartAI(chainId) ?? []
    const selectedPaymentToken = first(paymentTokens)
    const { token, balance } = useFungibleTokenWatched(selectedPaymentToken)

    const [{ loading: isPurchasing }, purchaseCallback] = usePurchaseCallback(
        asset?.value?.editionNumber ?? '0',
        asset?.value?.priceInWei > 0
            ? asset?.value?.priceInWei
            : new BigNumber(0.01).shiftedBy(selectedPaymentToken?.decimals ?? 18).toNumber(),
    )

    const assetLink = resolveAssetLinkOnCryptoartAI(asset?.value?.creator?.username, asset?.value?.token_id, chainId)
    const shareText = token
        ? t(
              isTwitter(activatedSocialNetworkUI) || isFacebook(activatedSocialNetworkUI)
                  ? 'plugin_cryptoartai_share'
                  : 'plugin_cryptoartai_share_no_official_account',
              {
                  amount: asset?.value?.priceInEth,
                  symbol: token?.value?.symbol,
                  title: asset?.value?.title,
                  assetLink,
                  account: isTwitter(activatedSocialNetworkUI) ? t('twitter_account') : t('facebook_account'),
              },
          )
        : ''
    const openShareTxDialog = useOpenShareTxDialog()
    const purchase = useCallback(async () => {
        const hash = await purchaseCallback()
        if (typeof hash !== 'string') return
        await openShareTxDialog({
            hash,
            onShare() {
                activatedSocialNetworkUI.utils.share?.(shareText)
            },
        })
    }, [purchaseCallback, openShareTxDialog])

    const validationMessage = useMemo(() => {
        if (!isVerified) return t('plugin_collectible_check_tos_document')
        if (new BigNumber(asset?.value?.priceInEth).gt(formatBalance(balance.value, token?.value?.decimals, 4))) {
            return t('plugin_collectible_insufficient_balance')
        }
        return ''
    }, [isVerified, balance.value, asset?.value])

    return (
        <InjectedDialog title={t('plugin_cryptoartai_buy')} open={open} onClose={onClose}>
            <DialogContent className={classes.content}>
                <Card elevation={0}>
                    <CardContent>
                        <Box className={classes.mediaContent}>
                            {asset?.value?.ossUrl.match(/\.(mp4|avi|webm)$/i) ? (
                                <Link href={asset.value.ossUrl} target="_blank" rel="noopener noreferrer">
                                    <img
                                        className={classes.player}
                                        src={asset.value.shareUrl}
                                        alt={asset.value.title}
                                    />
                                </Link>
                            ) : (
                                <img
                                    className={classes.player}
                                    src={asset?.value?.shareUrl}
                                    alt={asset?.value?.title}
                                />
                            )}
                        </Box>
                        <Box className={classes.container}>
                            <Typography variant="body1" sx={{ marginBottom: 1 }}>
                                <strong>
                                    {t('plugin_cryptoartai_buy') +
                                        ' ' +
                                        asset?.value?.title +
                                        ' ' +
                                        asset?.value?.priceInEth +
                                        ' ETH'}
                                </strong>
                            </Typography>
                            <Box className={classes.chain_row}>
                                <Typography variant="body2">{t('plugin_collectible_token_id')}</Typography>
                                <Typography variant="body2">{asset?.value?.editionNumber}</Typography>
                            </Box>
                            <Box className={classes.chain_row}>
                                <Typography variant="body2">{t('plugin_cryptoartai_current_balance')}</Typography>
                                <Typography variant="body2">
                                    {formatBalance(balance.value, token?.value?.decimals, 4)}
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                    <CardActions className={classes.footer}>
                        <EthereumWalletConnectedBoundary>
                            <ActionButton
                                loading={isPurchasing}
                                className={classes.button}
                                fullWidth
                                variant="contained"
                                disabled={!!validationMessage || isPurchasing}
                                onClick={purchase}>
                                {validationMessage || t('plugin_cryptoartai_buy_now')}
                            </ActionButton>
                        </EthereumWalletConnectedBoundary>
                    </CardActions>
                </Card>
            </DialogContent>
        </InjectedDialog>
    )
}
