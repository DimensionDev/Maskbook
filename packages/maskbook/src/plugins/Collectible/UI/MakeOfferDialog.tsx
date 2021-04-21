import { ChangeEvent, useState, useCallback, useMemo, useEffect } from 'react'
import {
    createStyles,
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
import BigNumber from 'bignumber.js'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { UnreviewedWarning } from './UnreviewedWarning'
import { useI18N } from '../../../utils/i18n-next-ui'
import ActionButton, { ActionButtonPromise } from '../../../extension/options-page/DashboardComponents/ActionButton'
import { SelectTokenAmountPanel } from '../../ITO/UI/SelectTokenAmountPanel'
import { ERC20TokenDetailed, EthereumTokenType, EtherTokenDetailed } from '../../../web3/types'
import { useTokenWatched } from '../../../web3/hooks/useTokenWatched'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import type { useAsset } from '../hooks/useAsset'
import { DateTimePanel } from '../../../web3/UI/DateTimePanel'
import { PluginCollectibleRPC } from '../messages'
import { ChainState } from '../../../web3/state/useChainState'
import { toAsset, toUnixTimestamp } from '../helpers'
import { useRemoteControlledDialogEvent } from '../../../utils/hooks/useRemoteControlledDialog'
import { PluginTraderMessages } from '../../Trader/messages'

const useStyles = makeStyles((theme) => {
    return createStyles({
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
    })
})

export interface MakeOfferDialogProps {
    asset?: ReturnType<typeof useAsset>
    open: boolean
    onClose: () => void
}

export function MakeOfferDialog(props: MakeOfferDialogProps) {
    const { asset, open, onClose } = props
    const isAuction = asset?.value?.is_auction ?? false
    const isVerified = asset?.value?.is_verified ?? false

    const { t } = useI18N()
    const classes = useStyles()

    const { account } = ChainState.useContainer()

    const [expirationDateTime, setExpirationDateTime] = useState(new Date())
    const [unreviewedChecked, setUnreviewedChecked] = useState(false)
    const [ToS_Checked, setToS_Checked] = useState(false)

    const { amount, token, balance, setAmount, setToken } = useTokenWatched()

    const onMakeOffer = useCallback(async () => {
        if (!asset?.value) return
        if (!asset.value.token_id || !asset.value.token_address) return
        if (!token?.value) return
        if (token.value.type !== EthereumTokenType.Ether && token.value.type !== EthereumTokenType.ERC20) return
        await PluginCollectibleRPC.createBuyOrder({
            asset: toAsset({
                tokenId: asset.value.token_id,
                tokenAddress: asset.value.token_address,
                schemaName: asset.value.asset_contract.schemaName,
            }),
            accountAddress: account,
            startAmount: Number.parseFloat(amount),
            expirationTime: toUnixTimestamp(expirationDateTime),
            paymentTokenAddress: token.value.type === EthereumTokenType.Ether ? undefined : token.value.address,
        })
    }, [asset?.value, token, account, amount, expirationDateTime])

    const { onOpen: openSwapDialog } = useRemoteControlledDialogEvent(PluginTraderMessages.events.swapDialogUpdated)

    useEffect(() => {
        setExpirationDateTime(new Date())
    }, [open])

    const validationMessage = useMemo(() => {
        if (new BigNumber(amount || '0').isZero()) return 'Enter a price'
        if (expirationDateTime.getTime() - Date.now() <= 0) return 'Invalid expiration date'
        if (!isVerified && !unreviewedChecked) return 'Please ensure unreviewed item'
        if (!isVerified && !ToS_Checked) return 'Please check ToS document'
        return ''
    }, [amount, expirationDateTime, isVerified, unreviewedChecked, ToS_Checked])

    return (
        <InjectedDialog title={isAuction ? 'Place a Bid' : 'Make an Offer'} open={open} onClose={onClose}>
            <DialogContent className={classes.content}>
                <Card elevation={0}>
                    <CardContent>
                        {isVerified ? null : (
                            <Box sx={{ marginBottom: 2 }}>
                                <UnreviewedWarning />
                            </Box>
                        )}
                        <SelectTokenAmountPanel
                            amount={amount}
                            balance={balance.value ?? '0'}
                            onAmountChange={setAmount}
                            token={token.value as EtherTokenDetailed | ERC20TokenDetailed}
                            onTokenChange={setToken}
                            TokenAmountPanelProps={{
                                label: 'Price',
                            }}
                            FixedTokenListProps={{
                                tokens: asset?.value?.offer_payment_tokens ?? [],
                                whitelist: asset?.value?.offer_payment_tokens.map((x) => x.address),
                            }}
                        />
                        {!isAuction ? (
                            <DateTimePanel
                                label="Expiration Date"
                                date={expirationDateTime}
                                onChange={setExpirationDateTime}
                                TextFieldProps={{
                                    className: classes.panel,
                                }}
                            />
                        ) : null}
                        <Box sx={{ padding: 2, paddingBottom: 0 }}>
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
                                    init={
                                        validationMessage ||
                                        t(isAuction ? 'plugin_collectible_place_bid' : 'plugin_collectible_make_offer')
                                    }
                                    waiting={t(
                                        isAuction ? 'plugin_collectible_place_bid' : 'plugin_collectible_make_offer',
                                    )}
                                    complete={t('plugin_collectible_done')}
                                    failed={t('plugin_collectible_retry')}
                                    executor={onMakeOffer}
                                    completeOnClick={onClose}
                                    failedOnClick="use executor"
                                />
                                {(isAuction ? asset?.value?.is_collection_weth : asset?.value?.is_order_weth) ? (
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
