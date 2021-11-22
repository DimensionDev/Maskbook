import { useCallback, useMemo, useEffect } from 'react'
import { DialogContent, Box, Card, CardContent, CardActions, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { first } from 'lodash-unified'
import { useChainId, useFungibleTokenWatched, TransactionStateType } from '@masknet/web3-shared-evm'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { useI18N } from '../../../utils'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import { useRemoteControlledDialog } from '@masknet/shared'
import { WalletMessages } from '../../Wallet/messages'
import type { useAsset } from '../hooks/useAsset'
import { formatBalance } from '@masknet/web3-shared-evm'
import { resolvePaymentTokensOnCryptoartAI } from '../pipes'
import { usePurchaseCallback } from '../hooks/usePurchaseCallback'

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

    const [purchaseState, purchaseCallback, resetCallback] = usePurchaseCallback(
        Number(asset?.value?.editionNumber),
        asset?.value?.priceInWei,
    )

    const onCheckout = useCallback(() => {
        purchaseCallback()
    }, [purchaseCallback])

    const { setDialog: setTransactionDialog } = useRemoteControlledDialog(
        WalletMessages.events.transactionDialogUpdated,
        (ev) => {
            if (ev.open) return
            resetCallback()
        },
    )

    useEffect(() => {
        if (purchaseState.type === TransactionStateType.UNKNOWN) return
        setTransactionDialog({
            open: true,
            state: purchaseState,
            summary: t('plugin_cryptoartai_buy') + ' ' + asset?.value?.title,
        })
    }, [purchaseState])

    const validationMessage = useMemo(() => {
        if (!isVerified) return t('plugin_collectible_check_tos_document')
        if (asset?.value?.priceInEth > Number(formatBalance(balance.value, token?.value?.decimals, 6))) {
            return t('plugin_collectible_insufficient_balance')
        }
        return ''
    }, [isVerified, balance.value, asset?.value])

    return (
        <InjectedDialog title={t('plugin_cryptoartai_buy')} open={open} onClose={onClose}>
            <DialogContent className={classes.content}>
                <Card elevation={0}>
                    <CardContent>
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
                                <Typography variant="body2">{t('plugin_cryptoartai_title')}</Typography>
                                <Typography variant="body2">{asset?.value?.title}</Typography>
                            </Box>
                            <Box className={classes.chain_row}>
                                <Typography variant="body2">{t('plugin_cryptoartai_currentbalance')}</Typography>
                                <Typography variant="body2">
                                    {formatBalance(balance.value, token?.value?.decimals, 6)}
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                    <CardActions className={classes.footer}>
                        <EthereumWalletConnectedBoundary>
                            <ActionButton
                                className={classes.button}
                                fullWidth
                                variant="contained"
                                disabled={!!validationMessage}
                                onClick={onCheckout}>
                                {validationMessage || t('plugin_cryptoartai_buynow')}
                            </ActionButton>
                        </EthereumWalletConnectedBoundary>
                    </CardActions>
                </Card>
            </DialogContent>
        </InjectedDialog>
    )
}
