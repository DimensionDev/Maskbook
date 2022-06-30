import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { EthereumAddress } from 'wallet.ts'
import { Box, Card, CardActions, CardContent, Checkbox, FormControlLabel, TextField, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { ChainId, isNativeTokenAddress, SchemaType } from '@masknet/web3-shared-evm'
import { isZero, isGreaterThan, NetworkPluginID, FungibleToken, NonFungibleAsset } from '@masknet/web3-shared-base'
import formatDateTime from 'date-fns/format'
import { PluginWalletStatusBar, useI18N } from '../../../../utils'
import { SelectTokenAmountPanel } from '../../../ITO/SNSAdaptor/SelectTokenAmountPanel'
import { WalletConnectedBoundary } from '../../../../web3/UI/WalletConnectedBoundary'
import { DateTimePanel } from '../../../../web3/UI/DateTimePanel'
import { toAsset } from '../../helpers'
import getUnixTime from 'date-fns/getUnixTime'
import { first } from 'lodash-unified'
import { isWyvernSchemaName } from '../../utils'
import { useAccount, useChainId, useFungibleTokenWatched } from '@masknet/plugin-infra/web3'
import { useOpenSea } from '../../hooks/useOpenSea'
import { ActionButtonPromise } from '../../../../extension/options-page/DashboardComponents/ActionButton'

const useStyles = makeStyles()((theme) => {
    return {
        content: {},
        footer: {
            display: 'flex',
            justifyContent: 'flex-end',
            padding: 0,
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
            padding: 0,
            margin: 0,
            height: 40,
        },
    }
})

export interface ListingByPriceCardProps {
    open: boolean
    onClose: () => void
    asset?: NonFungibleAsset<ChainId, SchemaType>
    paymentTokens: Array<FungibleToken<ChainId, SchemaType>>
}

export function ListingByPriceCard(props: ListingByPriceCardProps) {
    const { asset, paymentTokens, open, onClose } = props
    const { amount, token, balance, setAmount, setAddress } = useFungibleTokenWatched(
        NetworkPluginID.PLUGIN_EVM,
        first(paymentTokens)?.address,
    )
    const { t } = useI18N()
    const { classes } = useStyles()

    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const opensea = useOpenSea(chainId)

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
        if (!opensea) return
        if (!asset?.id || !asset.address) return
        if (token.value?.schema !== SchemaType.Native && token.value?.schema !== SchemaType.ERC20) return
        await opensea.createSellOrder({
            asset: toAsset({
                tokenId: asset.tokenId,
                tokenAddress: asset.address,
                schemaName: isWyvernSchemaName(asset.schema) ? asset.schema : undefined,
            }),
            accountAddress: account,
            startAmount: Number.parseFloat(amount),
            endAmount: endingPriceChecked && endingAmount ? Number.parseFloat(endingAmount) : undefined,
            listingTime: futureTimeChecked ? getUnixTime(scheduleTime) : undefined,
            expirationTime: endingPriceChecked ? getUnixTime(expirationTime) : undefined,
            buyerAddress: privacyChecked ? buyerAddress : undefined,
        })
    }, [
        asset,
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
        opensea,
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
                    token={token.value}
                    disableNativeToken={!paymentTokens.some(isNativeTokenAddress)}
                    onAmountChange={setAmount}
                    onTokenChange={(x) => setAddress(x.address)}
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
                    FungibleTokenListProps={{
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
                        token={token.value}
                        onTokenChange={(x) => setAddress(x.address)}
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
                <PluginWalletStatusBar>
                    <WalletConnectedBoundary>
                        <ActionButtonPromise
                            className={classes.button}
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
                    </WalletConnectedBoundary>
                </PluginWalletStatusBar>
            </CardActions>
        </Card>
    )
}
