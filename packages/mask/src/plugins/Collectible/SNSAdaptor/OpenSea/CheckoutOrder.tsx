import { Table, TableHead, TableBody, TableRow, TableCell, Typography, Link } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { Image } from '../../../../components/shared/Image'
import { CurrencyType, formatBalance, FungibleToken, NetworkPluginID } from '@masknet/web3-shared-base'
import { resolveAssetLinkOnCurrentProvider } from '../../pipes'
import { useI18N } from '../../../../utils'
import type { Order } from 'opensea-js/lib/types'
import { CollectibleState } from '../../hooks/useCollectibleState'
import { useChainId } from '@masknet/plugin-infra/web3'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'

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
    const { classes } = useStyles()
    const { token, asset, provider } = CollectibleState.useContainer()
    const order = asset?.value?.auction ?? asset?.value?.desktopOrder
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    if (!asset?.value || !token) return null
    if (!order) return null

    const price = (order as Order).currentPrice ?? asset.value.price?.[CurrencyType.USD]
    const getPrice = () => {
        if (!price) return 'error'
        const decimal = asset.value?.find((item: FungibleToken<ChainId, SchemaType>) => {
            return item.symbol === asset.value?.metadata?.symbol
        })?.decimals
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
                            <Image height={80} width={80} src={asset.value?.metadata?.imageURL ?? ''} />
                            <div className={classes.texts}>
                                <Typography>{asset.value.collection?.name ?? ''}</Typography>
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
