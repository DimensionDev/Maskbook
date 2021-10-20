import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { EthereumAddress } from 'wallet.ts'
import { useCustomSnackbar } from '@masknet/theme'
import { Box, Card, CardActions, CardContent, Checkbox, FormControlLabel, TextField, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import {
    EthereumTokenType,
    FungibleTokenDetailed,
    isGreaterThan,
    isNative,
    isZero,
    FungibleTokenWatched,
    useAccount,
} from '@masknet/web3-shared-evm'
import formatDateTime from 'date-fns/format'
import { useI18N } from '../../../utils'
import { ActionButtonPromise } from '../../../extension/options-page/DashboardComponents/ActionButton'
import { SelectTokenAmountPanel } from '../../ITO/SNSAdaptor/SelectTokenAmountPanel'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import { DateTimePanel } from '../../../web3/UI/DateTimePanel'
import { PluginCollectibleRPC } from '../messages'
import { toAsset, toUnixTimestamp } from '../helpers'
import type { useAsset } from '../hooks/useAsset'

const useStyles = makeStyles()((theme) => {
    return {
        content: {},
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
        label: {
            marginTop: theme.spacing(1.5),
        },
        caption: {
            fontSize: 11,
        },
        button: {
            marginTop: theme.spacing(1.5),
        },
    }
})

export interface ListingByPriceCardProps {
    open: boolean
    onClose: () => void
    asset?: ReturnType<typeof useAsset>
    tokenWatched: FungibleTokenWatched
    paymentTokens: FungibleTokenDetailed[]
}

export function ListingByPriceCard(props: ListingByPriceCardProps) {
    const { asset, tokenWatched, paymentTokens, open, onClose } = props
    const { amount, token, balance, setAmount, setToken } = tokenWatched

    const { t } = useI18N()
    const { classes } = useStyles()
    const { showSnackbar } = useCustomSnackbar()

    const account = useAccount()

    const [scheduleTime, setScheduleTime] = useState(new Date())
    const [expirationTime, setExpirationTime] = useState(new Date())
    const [buyerAddress, setBuyerAddress] = useState('')
    const [endingAmount, setEndingAmount] = useState('')

    const [endingPriceChecked, setEndingPriceChecked] = useState(false)
    const [futureTimeChecked, setFutureTimeChecked] = useState(false)
    const [privacyChecked, setPrivacyChecked] = useState(false)

    const validationMessage = useMemo(() => {
        if (isZero(amount || '0')) return t('plugin_collectible_enter_a_price')
        if (endingPriceChecked && endingAmount && !isGreaterThan(amount || '0', endingAmount || '0'))
            return t('plugin_collectible_invalid_ending_price')
        if (futureTimeChecked && Date.now() >= scheduleTime.getTime())
            return t('plugin_collectible_invalid_schedule_date')
        if (endingPriceChecked && Date.now() >= expirationTime.getTime())
            return t('plugin_collectible_invalid_expiration_date')
        if (privacyChecked && buyerAddress && !EthereumAddress.isValid(buyerAddress))
            return t('plugin_collectible_invalid_buyer_address')
        return ''
    }, [
        amount,
        endingPriceChecked,
        endingAmount,
        futureTimeChecked,
        scheduleTime,
        expirationTime,
        privacyChecked,
        buyerAddress,
    ])

    const onPostListing = useCallback(async () => {
        if (!asset?.value) return
        if (!asset.value.token_id || !asset.value.token_address) return
        if (!token?.value) return
        if (token.value.type !== EthereumTokenType.Native && token.value.type !== EthereumTokenType.ERC20) return
        try {
            await PluginCollectibleRPC.createSellOrder({
                asset: toAsset({
                    tokenId: asset.value.token_id,
                    tokenAddress: asset.value.token_address,
                    schemaName: asset.value.asset_contract.schemaName,
                }),
                accountAddress: account,
                startAmount: Number.parseFloat(amount),
                endAmount: endingPriceChecked && endingAmount ? Number.parseFloat(endingAmount) : undefined,
                listingTime: futureTimeChecked ? toUnixTimestamp(scheduleTime) : undefined,
                expirationTime: endingPriceChecked ? toUnixTimestamp(expirationTime) : undefined,
                buyerAddress: privacyChecked ? buyerAddress : undefined,
            })
        } catch (error) {
            if (error instanceof Error) {
                showSnackbar(error.message, { variant: 'error', preventDuplicate: true })
            }
            throw error
        }
    }, [
        asset?.value,
        token,
        amount,
        account,
        endingAmount,
        scheduleTime,
        expirationTime,
        buyerAddress,
        endingPriceChecked,
        futureTimeChecked,
        privacyChecked,
        showSnackbar,
    ])

    useEffect(() => {
        setAmount('')
        setScheduleTime(new Date())
        setExpirationTime(new Date())
        setBuyerAddress('')
        setEndingAmount('')
    }, [open])

    return (
        <Card elevation={0}>
            <CardContent>
                <SelectTokenAmountPanel
                    amount={amount}
                    balance={balance.value ?? '0'}
                    token={token.value as FungibleTokenDetailed}
                    disableNativeToken={!paymentTokens.some((x) => isNative(x.address))}
                    onAmountChange={setAmount}
                    onTokenChange={setToken}
                    TokenAmountPanelProps={{
                        label: endingPriceChecked
                            ? t('plugin_collectible_starting_price')
                            : t('plugin_collectible_price'),
                        TextFieldProps: {
                            classes: {
                                root: classes.panel,
                            },
                            helperText: endingPriceChecked
                                ? t('plugin_collectible_set_initial_price')
                                : t('plugin_collectible_ending_price_tip'),
                        },
                    }}
                    FixedTokenListProps={{
                        selectedTokens: token.value ? [token.value.address] : [],
                        tokens: paymentTokens,
                        whitelist: paymentTokens.map((x) => x.address),
                    }}
                />
                {endingPriceChecked ? (
                    <SelectTokenAmountPanel
                        amount={endingAmount}
                        balance={balance.value ?? '0'}
                        onAmountChange={setEndingAmount}
                        token={token.value as FungibleTokenDetailed}
                        onTokenChange={setToken}
                        TokenAmountPanelProps={{
                            label: t('plugin_collectible_ending_price'),
                            disableToken: true,
                            disableBalance: true,
                            TextFieldProps: {
                                classes: {
                                    root: classes.panel,
                                },
                                helperText: t('plugin_collectible_ending_price_less_than_staring'),
                            },
                        }}
                    />
                ) : null}
                {futureTimeChecked || endingPriceChecked ? (
                    <DateTimePanel
                        label={
                            endingPriceChecked
                                ? t('plugin_collectible_expiration_date')
                                : t('plugin_collectible_schedule_date')
                        }
                        date={endingPriceChecked ? expirationTime : scheduleTime}
                        min={formatDateTime(new Date(), "yyyy-MM-dd'T23:59")}
                        onChange={endingPriceChecked ? setExpirationTime : setScheduleTime}
                        className={classes.panel}
                        helperText={
                            endingPriceChecked
                                ? t('plugin_collectible_auto_cancel_tip')
                                : t('plugin_collectible_schedule_future_date')
                        }
                        fullWidth
                    />
                ) : null}
                {privacyChecked ? (
                    <TextField
                        className={classes.panel}
                        fullWidth
                        value={buyerAddress}
                        variant="outlined"
                        label={t('plugin_collectible_buyer_address')}
                        placeholder={t('plugin_collectible_buyer_address_placeholder')}
                        helperText={t('plugin_collectible_buyer_address_helper_text')}
                        onChange={(e) => setBuyerAddress(e.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                ) : null}
                <Box sx={{ padding: 2, paddingBottom: 0 }}>
                    <FormControlLabel
                        className={classes.label}
                        control={
                            <Checkbox
                                color="primary"
                                checked={endingPriceChecked}
                                onChange={(ev: ChangeEvent<HTMLInputElement>) =>
                                    setEndingPriceChecked(ev.target.checked)
                                }
                            />
                        }
                        label={
                            <>
                                <Typography>{t('plugin_collectible_include_ending_price')}</Typography>
                                <Typography className={classes.caption} color="textSecondary" variant="body2">
                                    {t('plugin_collectible_include_ending_price_helper')}
                                </Typography>
                            </>
                        }
                    />
                    <FormControlLabel
                        className={classes.label}
                        control={
                            <Checkbox
                                color="primary"
                                checked={futureTimeChecked}
                                onChange={(ev: ChangeEvent<HTMLInputElement>) =>
                                    setFutureTimeChecked(ev.target.checked)
                                }
                            />
                        }
                        label={
                            <>
                                <Typography>{t('plugin_collectible_schedule_for_a_future_time')}</Typography>
                                <Typography className={classes.caption} color="textSecondary" variant="body2">
                                    {t('plugin_collectible_schedule_for_a_future_time_helper')}
                                </Typography>
                            </>
                        }
                    />
                    <FormControlLabel
                        className={classes.label}
                        control={
                            <Checkbox
                                color="primary"
                                checked={privacyChecked}
                                onChange={(ev: ChangeEvent<HTMLInputElement>) => setPrivacyChecked(ev.target.checked)}
                            />
                        }
                        label={
                            <>
                                <Typography>{t('plugin_collectible_privacy')}</Typography>
                                <Typography className={classes.caption} color="textSecondary" variant="body2">
                                    {t('plugin_collectible_privacy_helper')}
                                </Typography>
                            </>
                        }
                    />
                </Box>
            </CardContent>
            <CardActions className={classes.footer}>
                <EthereumWalletConnectedBoundary>
                    <ActionButtonPromise
                        className={classes.button}
                        variant="contained"
                        disabled={!!validationMessage}
                        fullWidth
                        size="large"
                        init={validationMessage || t('plugin_collectible_post_listing')}
                        waiting={t('plugin_collectible_post_listing')}
                        complete={t('plugin_collectible_done')}
                        failed={t('plugin_collectible_retry')}
                        executor={onPostListing}
                        completeOnClick={onClose}
                        failedOnClick="use executor"
                    />
                </EthereumWalletConnectedBoundary>
            </CardActions>
        </Card>
    )
}
