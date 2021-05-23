import { useState, useMemo, useCallback, useEffect } from 'react'
import BigNumber from 'bignumber.js'
import { useSnackbar } from 'notistack'
import { makeStyles, Card, CardContent, CardActions } from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'
import { ActionButtonPromise } from '../../../extension/options-page/DashboardComponents/ActionButton'
import { SelectTokenAmountPanel } from '../../ITO/UI/SelectTokenAmountPanel'
import { NativeTokenDetailed, ERC20TokenDetailed, EthereumTokenType } from '../../../web3/types'
import type { TokenWatched } from '../../../web3/hooks/useTokenWatched'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import { DateTimePanel } from '../../../web3/UI/DateTimePanel'
import type { useAsset } from '../hooks/useAsset'
import { ChainState } from '../../../web3/state/useChainState'
import { PluginCollectibleRPC } from '../messages'
import { toAsset, toUnixTimestamp } from '../helpers'
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
        label: {},
        button: {
            marginTop: theme.spacing(1.5),
        },
    }
})

export interface ListingByHighestBidCardProps {
    open: boolean
    onClose: () => void
    asset?: ReturnType<typeof useAsset>
    tokenWatched: TokenWatched
    paymentTokens: (NativeTokenDetailed | ERC20TokenDetailed)[]
}

export function ListingByHighestBidCard(props: ListingByHighestBidCardProps) {
    const { asset, tokenWatched, paymentTokens, open, onClose } = props
    const { amount, token, balance, setAmount, setToken } = tokenWatched

    const { t } = useI18N()
    const classes = useStyles()
    const { enqueueSnackbar } = useSnackbar()

    const { account } = ChainState.useContainer()

    const [reservePrice, setReservePrice] = useState('')
    const [expirationDateTime, setExpirationDateTime] = useState(new Date())

    const validationMessage = useMemo(() => {
        if (new BigNumber(amount || '0').isZero()) return 'Enter minimum bid'
        if (new BigNumber(reservePrice || '0').isZero()) return 'Enter reserve price'
        if (new BigNumber(reservePrice).isLessThan(amount)) return 'Invalid reserve price'
        if (expirationDateTime.getTime() - Date.now() <= 0) return 'Invalid expiration date'
        return ''
    }, [amount, reservePrice, expirationDateTime])

    const onPostListing = useCallback(async () => {
        if (!asset?.value) return
        if (!asset.value.token_id || !asset.value.token_address) return
        if (!token?.value) return
        if (token.value.type !== EthereumTokenType.ERC20) return
        try {
            await PluginCollectibleRPC.createSellOrder({
                asset: toAsset({
                    tokenId: asset.value.token_id,
                    tokenAddress: asset.value.token_address,
                    schemaName: asset.value.asset_contract.schemaName,
                }),
                accountAddress: account,
                startAmount: Number.parseFloat(amount),
                expirationTime: toUnixTimestamp(expirationDateTime),
                englishAuctionReservePrice: Number.parseFloat(reservePrice),
                waitForHighestBid: true,
                paymentTokenAddress: token.value.address, // english auction must be erc20 token
            })
        } catch (e) {
            enqueueSnackbar(e.message, {
                variant: 'error',
                preventDuplicate: true,
            })
            throw e
        }
    }, [asset?.value, token, amount, account, reservePrice, expirationDateTime, enqueueSnackbar])

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
                    token={token.value as NativeTokenDetailed | ERC20TokenDetailed}
                    disableEther={!paymentTokens.some((x) => isNative(x.address))}
                    onAmountChange={setAmount}
                    onTokenChange={setToken}
                    TokenAmountPanelProps={{
                        classes: {
                            root: classes.panel,
                        },
                        label: 'Minimum Bid',
                        TextFieldProps: {
                            helperText: 'Set your starting bid price.',
                        },
                    }}
                    FixedTokenListProps={{
                        selectedTokens: token.value ? [token.value.address] : [],
                        tokens: paymentTokens,
                        whitelist: paymentTokens.map((x) => x.address),
                    }}
                />
                <SelectTokenAmountPanel
                    amount={reservePrice}
                    balance={balance.value ?? '0'}
                    onAmountChange={setReservePrice}
                    token={token.value as NativeTokenDetailed | ERC20TokenDetailed}
                    onTokenChange={setToken}
                    TokenAmountPanelProps={{
                        classes: {
                            root: classes.panel,
                        },
                        disableToken: true,
                        disableBalance: true,
                        label: 'Reserve Price',
                        TextFieldProps: {
                            helperText:
                                'Create a hidden limit by setting a reserve price. Reserve price must be greater than or equal to the start amount.',
                        },
                    }}
                />
                <DateTimePanel
                    label="Expiration Date"
                    date={expirationDateTime}
                    onChange={setExpirationDateTime}
                    TextFieldProps={{
                        className: classes.panel,
                        helperText:
                            'Your auction will automatically end at this time and the highest bidder will win. No need to cancel it!',
                        fullWidth: true,
                    }}
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
