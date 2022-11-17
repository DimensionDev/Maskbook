import type { Order } from 'opensea-js/lib/types.js'
import { makeStyles } from '@masknet/theme'
import { Image } from '@masknet/shared'
import { Table, TableHead, TableBody, TableRow, TableCell, Typography, Link } from '@mui/material'
import { CurrencyType, formatBalance } from '@masknet/web3-shared-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext } from '@masknet/web3-hooks-base'
import { resolveAssetLinkOnCurrentProvider } from '../../pipes/index.js'
import { useI18N } from '../../../../../utils/index.js'
import { Context } from '../Context/index.js'

const useStyles = makeStyles()((theme) => ({
    itemInfo: {
        display: 'flex',
        alignItems: 'center',
    },
    texts: {
        marginLeft: theme.spacing(1),
    },
}))

export interface CheckoutOrderProps {
    order?: Order
}

export function CheckoutOrder({ order }: CheckoutOrderProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const { tokenId, tokenAddress, asset, sourceType } = Context.useContainer()
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    if (!asset?.value || !tokenId || !tokenAddress || !order) return null

    const price = (order as Order).currentPrice ?? asset.value.price?.[CurrencyType.USD]

    const getPrice = () => {
        const decimals = order.paymentTokenContract?.decimals
        if (!decimals) return 'error'
        return formatBalance(price, decimals) ?? 'error'
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
                            <Image height={80} width={80} src={asset.value?.metadata?.imageURL ?? ''} />
                            <div className={classes.texts}>
                                <Typography>{asset.value.collection?.name ?? ''}</Typography>
                                {tokenAddress && tokenId ? (
                                    <Link
                                        color="primary"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        href={resolveAssetLinkOnCurrentProvider(
                                            chainId,
                                            tokenAddress,
                                            tokenId,
                                            sourceType,
                                        )}>
                                        <Typography>{asset.value.metadata?.name ?? ''}</Typography>
                                    </Link>
                                ) : (
                                    <Typography>{asset.value.metadata?.name ?? ''}</Typography>
                                )}
                            </div>
                        </div>
                    </TableCell>
                    <TableCell align="right">
                        <Typography>
                            {getPrice()} {asset.value.metadata?.symbol}
                        </Typography>
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>
                        <Typography>{t('plugin_collectible_total')}</Typography>
                    </TableCell>
                    <TableCell align="right">
                        <Typography>
                            {getPrice()} {asset.value.metadata?.symbol}
                        </Typography>
                    </TableCell>
                </TableRow>
            </TableBody>
        </Table>
    )
}
