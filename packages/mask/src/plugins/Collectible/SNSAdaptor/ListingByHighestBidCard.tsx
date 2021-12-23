import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, CardActions, CardContent } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import {
    EthereumTokenType,
    FungibleTokenDetailed,
    isNative,
    FungibleTokenWatched,
    useAccount,
} from '@masknet/web3-shared-evm'
import { isZero, isLessThan } from '@masknet/web3-shared-base'
import formatDateTime from 'date-fns/format'
import { useI18N } from '../../../utils'
import { ActionButtonPromise } from '../../../extension/options-page/DashboardComponents/ActionButton'
import { SelectTokenAmountPanel } from '../../ITO/SNSAdaptor/SelectTokenAmountPanel'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import { DateTimePanel } from '../../../web3/UI/DateTimePanel'
import type { useAsset } from '../hooks/useAsset'
import { PluginCollectibleRPC } from '../messages'
import { toAsset } from '../helpers'
import getUnixTime from 'date-fns/getUnixTime'

const useStyles = makeStyles()((theme) => ({
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
    button: {
        marginTop: theme.spacing(1.5),
    },
}))

export interface ListingByHighestBidCardProps {
    open: boolean
    onClose: () => void
    asset?: ReturnType<typeof useAsset>
    tokenWatched: FungibleTokenWatched
    paymentTokens: FungibleTokenDetailed[]
}

export function ListingByHighestBidCard(props: ListingByHighestBidCardProps) {
    const { asset, tokenWatched, paymentTokens, open, onClose } = props
    const { amount, token, balance, setAmount, setToken } = tokenWatched

    const { t } = useI18N()
    const { classes } = useStyles()

    const account = useAccount()

    const [reservePrice, setReservePrice] = useState('')
    const [expirationDateTime, setExpirationDateTime] = useState(new Date())

    const validationMessage = useMemo(() => {
        if (isZero(amount || '0')) return t('plugin_collectible_enter_minimum_bid')
        if (isZero(reservePrice || '0')) return t('plugin_collectible_enter_reserve_price')
        if (isLessThan(reservePrice, amount)) return t('plugin_collectible_invalid_reserve_price')
        if (expirationDateTime.getTime() - Date.now() <= 0) return t('plugin_collectible_invalid_expiration_date')
        return ''
    }, [amount, reservePrice, expirationDateTime])

    const onPostListing = useCallback(async () => {
        if (!asset?.value) return
        if (!asset.value.token_id || !asset.value.token_address) return
        if (!token?.value) return
        if (token.value.type !== EthereumTokenType.ERC20) return
        await PluginCollectibleRPC.createSellOrder({
            asset: toAsset({
                tokenId: asset.value.token_id,
                tokenAddress: asset.value.token_address,
                schemaName: asset.value.asset_contract.schema_name,
            }),
            accountAddress: account,
            startAmount: Number.parseFloat(amount),
            expirationTime: getUnixTime(expirationDateTime),
            englishAuctionReservePrice: Number.parseFloat(reservePrice),
            waitForHighestBid: true,
            paymentTokenAddress: token.value.address, // english auction must be erc20 token
        })
    }, [asset?.value, token, amount, account, reservePrice, expirationDateTime])

    useEffect(() => {
        setAmount('')
        setReservePrice('')
        setExpirationDateTime(new Date())
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
                        classes: {
                            root: classes.panel,
                        },
                        label: t('plugin_collectible_minimum_bid'),
                        TextFieldProps: {
                            helperText: t('plugin_collectible_set_starting_bid_price'),
                        },
                    }}
                    FungibleTokenListProps={{
                        selectedTokens: token.value ? [token.value.address] : [],
                        tokens: paymentTokens,
                        whitelist: paymentTokens.map((x) => x.address),
                    }}
                />
                <SelectTokenAmountPanel
                    amount={reservePrice}
                    balance={balance.value ?? '0'}
                    onAmountChange={setReservePrice}
                    token={token.value as FungibleTokenDetailed}
                    onTokenChange={setToken}
                    TokenAmountPanelProps={{
                        classes: {
                            root: classes.panel,
                        },
                        disableToken: true,
                        disableBalance: true,
                        label: t('plugin_collectible_reserve_price'),
                        TextFieldProps: {
                            helperText: t('plugin_collectible_reserve_price_helper'),
                        },
                    }}
                />
                <DateTimePanel
                    label={t('plugin_collectible_expiration_date')}
                    date={expirationDateTime}
                    min={formatDateTime(new Date(), "yyyy-MM-dd'T23:59")}
                    onChange={setExpirationDateTime}
                    className={classes.panel}
                    helperText={t('plugin_collectible_auction_auto_end')}
                    fullWidth
                />
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
