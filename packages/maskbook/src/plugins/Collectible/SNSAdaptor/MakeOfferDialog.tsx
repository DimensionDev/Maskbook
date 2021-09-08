import { ChangeEvent, useState, useCallback, useMemo, useEffect } from 'react'
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
} from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { first } from 'lodash-es'
import { useSnackbar } from '@masknet/theme'
import BigNumber from 'bignumber.js'
import {
    FungibleTokenDetailed,
    EthereumTokenType,
    useAccount,
    isNative,
    useFungibleTokenWatched,
} from '@masknet/web3-shared'
import formatDateTime from 'date-fns/format'
import { useI18N } from '../../../utils'
import { useRemoteControlledDialog } from '@masknet/shared'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { UnreviewedWarning } from './UnreviewedWarning'
import ActionButton, { ActionButtonPromise } from '../../../extension/options-page/DashboardComponents/ActionButton'
import { SelectTokenAmountPanel } from '../../ITO/SNSAdaptor/SelectTokenAmountPanel'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import type { useAsset } from '../hooks/useAsset'
import { DateTimePanel } from '../../../web3/UI/DateTimePanel'
import { PluginCollectibleRPC } from '../messages'
import { toAsset, toUnixTimestamp } from '../helpers'
import { PluginTraderMessages } from '../../Trader/messages'
import { Trans } from 'react-i18next'

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

export interface MakeOfferDialogProps {
    asset?: ReturnType<typeof useAsset>
    open: boolean
    onClose: () => void
}

export function MakeOfferDialog(props: MakeOfferDialogProps) {
    const { asset, open, onClose } = props
    const isAuction = asset?.value?.is_auction ?? false
    const isVerified = asset?.value?.is_verified ?? false
    const paymentTokens = (isAuction ? asset?.value?.order_payment_tokens : asset?.value?.offer_payment_tokens) ?? []
    const selectedPaymentToken = first(paymentTokens)

    const { t } = useI18N()
    const { classes } = useStyles()
    const { enqueueSnackbar } = useSnackbar()

    const account = useAccount()

    const [expirationDateTime, setExpirationDateTime] = useState(new Date())
    const [unreviewedChecked, setUnreviewedChecked] = useState(false)
    const [ToS_Checked, setToS_Checked] = useState(false)

    const { amount, token, balance, setAmount, setToken } = useFungibleTokenWatched(selectedPaymentToken)

    const onMakeOffer = useCallback(async () => {
        if (!asset?.value) return
        if (!asset.value.token_id || !asset.value.token_address) return
        if (!token?.value) return
        if (token.value.type !== EthereumTokenType.Native && token.value.type !== EthereumTokenType.ERC20) return
        try {
            await PluginCollectibleRPC.createBuyOrder({
                asset: toAsset({
                    tokenId: asset.value.token_id,
                    tokenAddress: asset.value.token_address,
                    schemaName: asset.value.asset_contract.schemaName,
                }),
                accountAddress: account,
                startAmount: Number.parseFloat(amount),
                expirationTime: !isAuction ? toUnixTimestamp(expirationDateTime) : undefined,
                paymentTokenAddress: token.value.type === EthereumTokenType.Native ? undefined : token.value.address,
            })
        } catch (error) {
            if (error instanceof Error) {
                enqueueSnackbar(error.message, { variant: 'error', preventDuplicate: true })
            }
            throw error
        }
    }, [asset?.value, token, account, amount, expirationDateTime, isAuction, enqueueSnackbar])

    const { openDialog: openSwapDialog } = useRemoteControlledDialog(PluginTraderMessages.swapDialogUpdated)

    useEffect(() => {
        setAmount('')
        setExpirationDateTime(new Date())
    }, [open])

    const validationMessage = useMemo(() => {
        const amount_ = new BigNumber(amount || '0')
        const balance_ = new BigNumber(balance.value ?? '0')
        if (amount_.isZero()) return t('plugin_collectible_enter_a_price')
        if (balance_.isZero() || amount_.isGreaterThan(balance_)) return t('plugin_collectible_insufficient_balance')
        if (!isAuction && expirationDateTime.getTime() - Date.now() <= 0)
            return t('plugin_collectible_invalid_expiration_date')
        if (!isVerified && !unreviewedChecked) return t('plugin_collectible_ensure_unreviewed_item')
        if (!isVerified && !ToS_Checked) return t('plugin_collectible_check_tos_document')
        return ''
    }, [amount, balance.value, expirationDateTime, isVerified, isAuction, unreviewedChecked, ToS_Checked])

    if (!asset?.value) return null
    return (
        <InjectedDialog
            title={isAuction ? t('plugin_collectible_place_a_bid') : t('plugin_collectible_make_an_offer')}
            open={open}
            onClose={onClose}>
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
                            token={token.value as FungibleTokenDetailed}
                            disableNativeToken={!paymentTokens.some((x) => isNative(x.address))}
                            onAmountChange={setAmount}
                            onTokenChange={setToken}
                            TokenAmountPanelProps={{
                                label: t('plugin_collectible_price'),
                            }}
                            FixedTokenListProps={{
                                selectedTokens: selectedPaymentToken ? [selectedPaymentToken.address] : [],
                                tokens: paymentTokens,
                                whitelist: paymentTokens.map((x) => x.address),
                            }}
                        />
                        {!isAuction ? (
                            <DateTimePanel
                                label={t('plugin_collectible_expiration_date')}
                                date={expirationDateTime}
                                min={formatDateTime(new Date(), "yyyy-MM-dd'T00:00")}
                                onChange={setExpirationDateTime}
                                className={classes.panel}
                                fullWidth
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
                                                {t('plugin_collectible_approved_by_open_sea')}
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
                                                    i18nKey="plugin_collectible_legal_text"
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
                                {(isAuction ? asset.value?.is_collection_weth : asset.value?.is_order_weth) ? (
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
