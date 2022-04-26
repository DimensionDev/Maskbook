import { Table, TableHead, TableBody, TableRow, TableCell, Typography, Link } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { Image } from '../../../components/shared/Image'
import { formatBalance, SchemaType } from '@masknet/web3-shared-evm'
import { useChainId } from '@masknet/plugin-infra/web3'
import { FungibleToken, NetworkPluginID } from '@masknet/web3-shared-base'
import { resolveAssetLinkOnCurrentProvider } from '../pipes'
import { useI18N } from '../../../utils'
import type { Order } from 'opensea-js/lib/types'
import { CollectibleState } from '../hooks/useCollectibleState'

const useStyles = makeStyles()((theme) => ({
    itemInfo: {
        display: 'flex',
        alignItems: 'center',
    },
    texts: {
        marginLeft: theme.spacing(1),
    },
}))

export function CheckoutOrder() {
    const { t } = useI18N()
    const { token, asset, assetOrder, provider } = CollectibleState.useContainer()
    const order = assetOrder?.value ?? asset?.value?.desktopOrder
    const { classes } = useStyles()
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    if (!asset?.value || !token) return null
    if (!order) return null

    const price = (order as Order).currentPrice ?? asset.value.current_price
    const getPrice = () => {
        if (!price) return 'error'
        const decimal = asset.value?.response_.collection.payment_tokens.find(
            (item: FungibleToken<ChianId, SchemaType.ERC20>) => {
                return item.symbol === asset.value?.current_symbol
            },
        )?.decimals
        if (!decimal) return 'error'
        return formatBalance(price, decimal) ?? 'error'
    }

    return (
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell>{t('plugin_collectible_item')}</TableCell>
                    <TableCell align="right">{t('plugin_collectible_subtotal')}</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                <TableRow>
                    <TableCell>
                        <div className={classes.itemInfo}>
                            <Image height={80} width={80} src={asset.value?.image_url ?? ''} />
                            <div className={classes.texts}>
                                <Typography>{asset.value.collection_name ?? ''}</Typography>
                                {token.contractAddress && token.tokenId ? (
                                    <Link
                                        color="primary"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        href={resolveAssetLinkOnCurrentProvider(
                                            chainId,
                                            token.contractAddress,
                                            token.tokenId,
                                            provider,
                                        )}>
                                        <Typography>{asset.value.name ?? ''}</Typography>
                                    </Link>
                                ) : (
                                    <Typography>{asset.value.name ?? ''}</Typography>
                                )}
                            </div>
                        </div>
                    </TableCell>
                    <TableCell align="right">
                        <Typography>
                            {getPrice()} {asset.value.current_symbol}
                        </Typography>
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>
                        <Typography>{t('plugin_collectible_total')}</Typography>
                    </TableCell>
                    <TableCell align="right">
                        <Typography>
                            {getPrice()} {asset.value.current_symbol}
                        </Typography>
                    </TableCell>
                </TableRow>
            </TableBody>
        </Table>
    )
}
