import { first } from 'lodash-unified'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, CardActions, CardContent } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { ChainId, isNativeTokenAddress, SchemaType } from '@masknet/web3-shared-evm'
import { isZero, isLessThan, NetworkPluginID, NonFungibleAsset, FungibleToken } from '@masknet/web3-shared-base'
import formatDateTime from 'date-fns/format'
import { useI18N } from '../../../../utils'
import { ActionButtonPromise } from '../../../../extension/options-page/DashboardComponents/ActionButton'
import { SelectTokenAmountPanel } from '../../../ITO/SNSAdaptor/SelectTokenAmountPanel'
import { WalletConnectedBoundary } from '../../../../web3/UI/WalletConnectedBoundary'
import { DateTimePanel } from '../../../../web3/UI/DateTimePanel'
import { toAsset } from '../../helpers'
import getUnixTime from 'date-fns/getUnixTime'
import { isWyvernSchemaName } from '../../utils'
import { useAccount, useChainId, useFungibleTokenWatched } from '@masknet/plugin-infra/web3'
import { useOpenSea } from '../../hooks/useOpenSea'

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
    asset?: NonFungibleAsset<ChainId, SchemaType>
    paymentTokens: Array<FungibleToken<ChainId, SchemaType>>
}

export function ListingByHighestBidCard(props: ListingByHighestBidCardProps) {
    const { asset, paymentTokens, open, onClose } = props
    const { t } = useI18N()
    const { classes } = useStyles()
    const { amount, token, balance, setAmount, setAddress } = useFungibleTokenWatched(
        NetworkPluginID.PLUGIN_EVM,
        first(paymentTokens)?.address,
    )

    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const opensea = useOpenSea(chainId)

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
        if (token?.value?.schema !== SchemaType.ERC20) return
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
            paymentTokenAddress: token.value.address, // english auction must be erc20 token
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
                    disableNativeToken={!paymentTokens.some(isNativeTokenAddress)}
                    onAmountChange={setAmount}
                    onTokenChange={(x) => setAddress(x.address)}
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
                    token={token.value}
                    onTokenChange={(x) => setAddress(x.address)}
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
            </CardActions>
        </Card>
    )
}
