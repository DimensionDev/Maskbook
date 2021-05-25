import { ChangeEvent, useState, useCallback, useMemo } from 'react'
import {
    makeStyles,
    DialogContent,
    Box,
    Checkbox,
    Card,
    CardContent,
    CardActions,
    FormControlLabel,
    Typography,
    Link,
} from '@material-ui/core'
import { useSnackbar } from 'notistack'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { UnreviewedWarning } from './UnreviewedWarning'
import { useI18N, useRemoteControlledDialog } from '../../../utils'
import ActionButton, { ActionButtonPromise } from '../../../extension/options-page/DashboardComponents/ActionButton'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import type { useAsset } from '../hooks/useAsset'
import { PluginCollectibleRPC } from '../messages'
import { ChainState } from '../../../web3/state/useChainState'
import { PluginTraderMessages } from '../../Trader/messages'
import { CheckoutOrder } from './CheckoutOrder'

const useStyles = makeStyles((theme) => {
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
    open: boolean
    onClose: () => void
}

export function CheckoutDialog(props: CheckoutDialogProps) {
    const { asset, open, onClose } = props
    const isAuction = asset?.value?.is_auction ?? false
    const isVerified = asset?.value?.is_verified ?? false

    const { t } = useI18N()
    const classes = useStyles()
    const { enqueueSnackbar } = useSnackbar()

    const { account } = ChainState.useContainer()

    const [unreviewedChecked, setUnreviewedChecked] = useState(false)
    const [ToS_Checked, setToS_Checked] = useState(false)

    const onCheckout = useCallback(async () => {
        if (!asset?.value) return
        if (!asset.value.token_id || !asset.value.token_address) return
        if (!asset.value.order_) return
        try {
            await PluginCollectibleRPC.fulfillOrder({
                order: asset.value.order_,
                accountAddress: account,
                recipientAddress: account,
            })
        } catch (e) {
            enqueueSnackbar(e.message, {
                variant: 'error',
                preventDuplicate: true,
            })
            throw e
        }
    }, [asset?.value, account, enqueueSnackbar])

    const { openDialog: openSwapDialog } = useRemoteControlledDialog(PluginTraderMessages.events.swapDialogUpdated)

    const validationMessage = useMemo(() => {
        if (!isVerified && !unreviewedChecked) return 'Please ensure unreviewed item'
        if (!isVerified && !ToS_Checked) return 'Please check ToS document'
        return ''
    }, [isVerified, unreviewedChecked, ToS_Checked])

    return (
        <InjectedDialog title="Checkout" open={open} onClose={onClose}>
            <DialogContent className={classes.content}>
                <Card elevation={0}>
                    <CardContent>
                        {isVerified ? null : (
                            <Box sx={{ marginBottom: 2 }}>
                                <UnreviewedWarning />
                            </Box>
                        )}
                        <Box sx={{ padding: 2 }}>
                            <CheckoutOrder asset={asset} />
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
                                                By checking this box, I acknowledge that this item has not been reviewd
                                                or approved by OpenSea.
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
                                                By checking this box, I agree to OpenSea's{' '}
                                                <Link
                                                    color="primary"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    href="https://opensea.io/tos">
                                                    Terms of Service
                                                </Link>
                                                .
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
                                {asset?.value?.is_order_weth ? (
                                    <ActionButton
                                        className={classes.button}
                                        variant="contained"
                                        size="large"
                                        onClick={openSwapDialog}>
                                        Convert ETH
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
