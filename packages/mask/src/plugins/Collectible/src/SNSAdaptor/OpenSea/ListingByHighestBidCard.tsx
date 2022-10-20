import { useCallback, useEffect, useMemo, useState } from 'react'
import { first } from 'lodash-unified'
import { Card, CardActions, CardContent, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { isZero, isLessThan } from '@masknet/web3-shared-base'
import formatDateTime from 'date-fns/format'
import { PluginWalletStatusBar } from '@masknet/shared'
import getUnixTime from 'date-fns/getUnixTime'
import {
    useAccount,
    useChainId,
    useCurrentWeb3NetworkPluginID,
    useFungibleTokenWatched,
    useWeb3State,
} from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useI18N } from '../../../../../utils/index.js'
import { SelectTokenAmountPanel } from '../../../../ITO/SNSAdaptor/SelectTokenAmountPanel.js'
import { WalletConnectedBoundary } from '../../../../../web3/UI/WalletConnectedBoundary.js'
import { DateTimePanel } from '../../../../../web3/UI/DateTimePanel.js'
import { ActionButtonPromise } from '../../../../../extension/options-page/DashboardComponents/ActionButton.js'
import { useOpenSea } from './hooks/useOpenSea.js'
import { isWyvernSchemaName, toAsset } from '../../helpers/index.js'

const useStyles = makeStyles()((theme) => ({
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
    button: {
        margin: 0,
        padding: 0,
        height: 40,
    },
    stateBar: {
        marginTop: theme.spacing(1.5),
    },
    helperText: {
        color: theme.palette.maskColor.second,
        margin: theme.spacing(1, 0, 2),
        fontSize: 12,
    },
}))

export interface ListingByHighestBidCardProps {
    open: boolean
    onClose: () => void
    asset?: Web3Helper.NonFungibleAssetScope<'all'>
    paymentTokens: Array<Web3Helper.FungibleTokenScope<'all'>>
}

export function ListingByHighestBidCard(props: ListingByHighestBidCardProps) {
    const { asset, paymentTokens, open, onClose } = props
    const { t } = useI18N()
    const { classes } = useStyles()

    const { Others } = useWeb3State()
    const pluginID = useCurrentWeb3NetworkPluginID()
    const { amount, token, balance, setAmount, setAddress } = useFungibleTokenWatched(
        pluginID,
        first(paymentTokens)?.address,
    )

    const account = useAccount()
    const chainId = useChainId()
    const opensea = useOpenSea(pluginID, chainId)

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
        if (!opensea) return
        if (!asset?.tokenId || !asset.address) return

        if (
            Others?.isFungibleTokenSchemaType(token?.value?.schema) &&
            !Others?.isNativeTokenSchemaType(token?.value?.schema)
        )
            return
        await opensea.createSellOrder({
            asset: toAsset({
                tokenId: asset.tokenId,
                tokenAddress: asset.address,
                schemaName: isWyvernSchemaName(asset.schema) ? asset.schema : undefined,
            }),
            accountAddress: account,
            startAmount: Number.parseFloat(amount),
            expirationTime: getUnixTime(expirationDateTime),
            englishAuctionReservePrice: Number.parseFloat(reservePrice),
            waitForHighestBid: true,
            paymentTokenAddress: token?.value?.address, // english auction must be erc20 token
        })
    }, [asset, token, amount, account, reservePrice, expirationDateTime, opensea])

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
                    token={token.value}
                    disableNativeToken={!paymentTokens.some((x) => Others?.isNativeTokenAddress(x.address))}
                    onAmountChange={setAmount}
                    onTokenChange={(x) => setAddress(x.address)}
                    FungibleTokenInputProps={{
                        label: t('plugin_collectible_minimum_bid'),
                    }}
                    FungibleTokenListProps={{
                        selectedTokens: token.value ? [token.value.address] : [],
                        tokens: paymentTokens,
                        whitelist: paymentTokens.map((x) => x.address),
                    }}
                />
                <Typography className={classes.helperText}>{t('plugin_collectible_set_starting_bid_price')}</Typography>
                <SelectTokenAmountPanel
                    amount={reservePrice}
                    balance={balance.value ?? '0'}
                    onAmountChange={setReservePrice}
                    token={token.value}
                    onTokenChange={(x) => setAddress(x.address)}
                    FungibleTokenInputProps={{
                        disableToken: true,
                        disableBalance: true,
                        label: t('plugin_collectible_reserve_price'),
                    }}
                />
                <Typography className={classes.helperText}>{t('plugin_collectible_reserve_price_helper')}</Typography>
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
                <PluginWalletStatusBar className={classes.stateBar}>
                    <WalletConnectedBoundary>
                        <ActionButtonPromise
                            className={classes.button}
                            disabled={!!validationMessage}
                            fullWidth
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
