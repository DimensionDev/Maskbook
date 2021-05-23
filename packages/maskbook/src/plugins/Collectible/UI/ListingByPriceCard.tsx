import { ChangeEvent, useState, useMemo, useCallback, useEffect } from 'react'
import BigNumber from 'bignumber.js'
import { EthereumAddress } from 'wallet.ts'
import { useSnackbar } from 'notistack'
import {
    makeStyles,
    Box,
    Checkbox,
    Card,
    CardContent,
    CardActions,
    FormControlLabel,
    Typography,
    TextField,
} from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'
import { ActionButtonPromise } from '../../../extension/options-page/DashboardComponents/ActionButton'
import { SelectTokenAmountPanel } from '../../ITO/UI/SelectTokenAmountPanel'
import { NativeTokenDetailed, ERC20TokenDetailed, EthereumTokenType } from '../../../web3/types'
import type { TokenWatched } from '../../../web3/hooks/useTokenWatched'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import { DateTimePanel } from '../../../web3/UI/DateTimePanel'
import { PluginCollectibleRPC } from '../messages'
import { ChainState } from '../../../web3/state/useChainState'
import { toAsset, toUnixTimestamp } from '../helpers'
import type { useAsset } from '../hooks/useAsset'
import { isNative } from '../../../web3/helpers'

const useStyles = makeStyles((theme) => {
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
    tokenWatched: TokenWatched
    paymentTokens: (NativeTokenDetailed | ERC20TokenDetailed)[]
}

export function ListingByPriceCard(props: ListingByPriceCardProps) {
    const { asset, tokenWatched, paymentTokens, open, onClose } = props
    const { amount, token, balance, setAmount, setToken } = tokenWatched

    const { t } = useI18N()
    const classes = useStyles()
    const { enqueueSnackbar } = useSnackbar()

    const { account } = ChainState.useContainer()

    const [scheduleTime, setScheduleTime] = useState(new Date())
    const [expirationTime, setExpirationTime] = useState(new Date())
    const [buyerAddress, setBuyerAddress] = useState('')
    const [endingAmount, setEndingAmount] = useState('')

    const [endingPriceChecked, setEndingPriceChecked] = useState(false)
    const [futureTimeChecked, setFutureTimeChecked] = useState(false)
    const [privacyChecked, setPrivacyChecked] = useState(false)

    const validationMessage = useMemo(() => {
        if (new BigNumber(amount || '0').isZero()) return 'Enter a price'
        if (endingPriceChecked && endingAmount && !new BigNumber(amount || '0').isGreaterThan(endingAmount || '0'))
            return 'Invalid ending price'
        if (futureTimeChecked && Date.now() >= scheduleTime.getTime()) return 'Invalid schedule date'
        if (endingPriceChecked && Date.now() >= expirationTime.getTime()) return 'Invalid expiration date'
        if (privacyChecked && buyerAddress && !EthereumAddress.isValid(buyerAddress)) return 'Invalid buyer address'
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
        } catch (e) {
            enqueueSnackbar(e.message, {
                variant: 'error',
                preventDuplicate: true,
            })
            throw e
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
        enqueueSnackbar,
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
                    token={token.value as NativeTokenDetailed | ERC20TokenDetailed}
                    disableEther={!paymentTokens.some((x) => isNative(x.address))}
                    onAmountChange={setAmount}
                    onTokenChange={setToken}
                    TokenAmountPanelProps={{
                        label: endingPriceChecked ? 'Starting Price' : 'Price',
                        TextFieldProps: {
                            classes: {
                                root: classes.panel,
                            },
                            helperText: endingPriceChecked
                                ? 'Set an initial price.'
                                : 'Will be on sale until you transfer this item or cancel it.',
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
                        token={token.value as NativeTokenDetailed | ERC20TokenDetailed}
                        onTokenChange={setToken}
                        TokenAmountPanelProps={{
                            label: 'Ending Price',
                            disableToken: true,
                            disableBalance: true,
                            TextFieldProps: {
                                classes: {
                                    root: classes.panel,
                                },
                                helperText:
                                    'Must be less than or equal to the starting price. The price will progress linearly to this amount until the expiration date.',
                            },
                        }}
                    />
                ) : null}
                {futureTimeChecked || endingPriceChecked ? (
                    <DateTimePanel
                        label={endingPriceChecked ? 'Expiration date' : 'Schedule Date'}
                        date={endingPriceChecked ? expirationTime : scheduleTime}
                        onChange={endingPriceChecked ? setExpirationTime : setScheduleTime}
                        TextFieldProps={{
                            className: classes.panel,
                            helperText: endingPriceChecked
                                ? 'Your listing will automatically end at this time. No need to cancel it!'
                                : 'Schedule a future date.',
                            fullWidth: true,
                        }}
                    />
                ) : null}
                {privacyChecked ? (
                    <TextField
                        className={classes.panel}
                        fullWidth
                        value={buyerAddress}
                        variant="outlined"
                        label="Buyer Address"
                        placeholder="Enter the buyer's address."
                        helperText="Only the buyer is allowed to buy it."
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
                                <Typography>Include ending price</Typography>
                                <Typography className={classes.caption} color="textSecondary" variant="body2">
                                    Adding an ending price will allow this listing to expire, or for the price to be
                                    reduced until a buyer is found.
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
                                <Typography>Schedule for a future time</Typography>
                                <Typography className={classes.caption} color="textSecondary" variant="body2">
                                    You can schedule this listing to only be buyable at a future data.
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
                                <Typography>Privacy</Typography>
                                <Typography className={classes.caption} color="textSecondary" variant="body2">
                                    You can keep your listing public, or you can specify one address that's allowed to
                                    buy it.
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
