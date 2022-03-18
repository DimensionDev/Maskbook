import { ChangeEvent, useState, useCallback, useMemo } from 'react'
import {
    DialogContent,
    Box,
    Checkbox,
    Card,
    CardContent,
    CardActions,
    FormControlLabel,
    Typography,
    Link,
} from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { Trans } from 'react-i18next'
import { EthereumTokenType, useAccount, useFungibleTokenWatched } from '@masknet/web3-shared-evm'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { UnreviewedWarning } from './UnreviewedWarning'
import { useI18N } from '../../../utils'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import ActionButton, { ActionButtonPromise } from '../../../extension/options-page/DashboardComponents/ActionButton'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import { PluginCollectibleRPC } from '../messages'
import { PluginTraderMessages } from '../../Trader/messages'
import { CheckoutOrder } from './CheckoutOrder'
import type { useAsset } from '@masknet/plugin-evm/src/hooks'
import type { useAssetOrder } from '../hooks/useAssetOrder'
import type { Coin } from '../../Trader/types'
import { isGreaterThan } from '@masknet/web3-shared-base'

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
    }
})

export interface CheckoutDialogProps {
    asset?: ReturnType<typeof useAsset>
    order: ReturnType<typeof useAssetOrder>
    open: boolean
    onClose: () => void
}

export function CheckoutDialog(props: CheckoutDialogProps) {
    const { asset, open, onClose, order } = props
    const isVerified = asset?.value?.is_verified ?? false
    const { t } = useI18N()
    const { classes } = useStyles()
    const account = useAccount()

    const [unreviewedChecked, setUnreviewedChecked] = useState(false)
    const [ToS_Checked, setToS_Checked] = useState(false)
    const [insufficientBalance, setInsufficientBalance] = useState(false)
    const { token, balance } = useFungibleTokenWatched({
        type: EthereumTokenType.Native,
        address: order.value?.paymentTokenContract?.address ?? '',
    })
    const onCheckout = useCallback(async () => {
        if (!asset?.value) return
        if (!asset.value.token_id || !asset.value.token_address) return
        if (!order.value) return

        await PluginCollectibleRPC.fulfillOrder({
            order: order.value,
            accountAddress: account,
            recipientAddress: account,
        })
    }, [asset?.value, account, order?.value])

    const { setDialog: openSwapDialog } = useRemoteControlledDialog(PluginTraderMessages.swapDialogUpdated)

    const onConvertClick = useCallback(() => {
        if (!token?.value) return
        openSwapDialog({
            open: true,
            traderProps: {
                coin: {
                    id: token.value.address,
                    name: token.value.name ?? '',
                    symbol: token.value.symbol ?? '',
                    contract_address: token.value.address,
                    decimals: token.value.decimals,
                } as Coin,
            },
        })
    }, [token.value, openSwapDialog])

    const validationMessage = useMemo(() => {
        if (isGreaterThan(order?.value?.basePrice ?? 0, balance.value ?? 0)) {
            setInsufficientBalance(true)
            return t('plugin_collectible_insufficient_balance')
        }
        if (!isVerified && !unreviewedChecked) return t('plugin_collectible_ensure_unreviewed_item')
        if (!isVerified && !ToS_Checked) return t('plugin_collectible_check_tos_document')
        return ''
    }, [isVerified, unreviewedChecked, ToS_Checked, order.value])

    return (
        <InjectedDialog title={t('plugin_collectible_checkout')} open={open} onClose={onClose}>
            <DialogContent className={classes.content}>
                <Card elevation={0}>
                    <CardContent>
                        {isVerified ? null : (
                            <Box sx={{ marginBottom: 2 }}>
                                <UnreviewedWarning />
                            </Box>
                        )}
                        <Box sx={{ padding: 2 }}>
                            <CheckoutOrder />
                            {isVerified ? null : (
                                <>
                                    <FormControlLabel
                                        className={classes.label}
                                        control={
                                            <Checkbox
                                                color="primary"
                                                checked={unreviewedChecked}
                                                onChange={(ev: ChangeEvent<HTMLInputElement>) =>
                                                    setUnreviewedChecked(ev.target.checked)
                                                }
                                            />
                                        }
                                        label={
                                            <Typography variant="body2">
                                                {t('plugin_collectible_approved_tips')}
                                            </Typography>
                                        }
                                    />
                                    <FormControlLabel
                                        className={classes.label}
                                        control={
                                            <Checkbox
                                                color="primary"
                                                checked={ToS_Checked}
                                                onChange={(ev: ChangeEvent<HTMLInputElement>) =>
                                                    setToS_Checked(ev.target.checked)
                                                }
                                            />
                                        }
                                        label={
                                            <Typography variant="body2">
                                                <Trans
                                                    i18nKey="plugin_collectible_agree_terms"
                                                    components={{
                                                        terms: (
                                                            <Link
                                                                color="primary"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                href="https://opensea.io/tos"
                                                            />
                                                        ),
                                                    }}
                                                />
                                            </Typography>
                                        }
                                    />
                                </>
                            )}
                        </Box>
                    </CardContent>
                    <CardActions className={classes.footer}>
                        <EthereumWalletConnectedBoundary>
                            <Box className={classes.buttons} display="flex" alignItems="center" justifyContent="center">
                                <ActionButtonPromise
                                    className={classes.button}
                                    variant="contained"
                                    disabled={!!validationMessage}
                                    size="large"
                                    init={validationMessage || t('plugin_collectible_checkout')}
                                    waiting={t('plugin_collectible_checkout')}
                                    complete={t('plugin_collectible_done')}
                                    failed={t('plugin_collectible_retry')}
                                    executor={onCheckout}
                                    completeOnClick={onClose}
                                    failedOnClick="use executor"
                                />
                                {asset?.value?.isOrderWeth || insufficientBalance ? (
                                    <ActionButton
                                        className={classes.button}
                                        variant="contained"
                                        size="large"
                                        onClick={onConvertClick}>
                                        {insufficientBalance
                                            ? t('plugin_collectible_get_more_token', { token: token.value?.symbol })
                                            : t('plugin_collectible_convert_eth')}
                                    </ActionButton>
                                ) : null}
                            </Box>
                        </EthereumWalletConnectedBoundary>
                    </CardActions>
                </Card>
            </DialogContent>
        </InjectedDialog>
    )
}
