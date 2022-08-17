import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import type { Web3Helper } from '@masknet/plugin-infra/src/web3-helpers'
import { NetworkPluginID, isZero, NonFungibleTokenOrder } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { useI18N } from '../../../utils'

const useStyles = makeStyles()((theme) => ({
    wrapper: {
        width: '100%',
        background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(28, 104, 243, 0.2) 0%, rgba(45, 41, 253, 0.2) 100%), #FFFFFF',
        padding: 12,
        boxSizing: 'border-box',
        borderRadius: 12,
    },
    header: {
        display: 'flex',
        width: '100%',
        justifyContent: 'space-between',
    },
    textBase: {
        fontSize: 14,
        color: theme.palette.maskColor.publicSecond,
        '& > strong': {
            color: theme.palette.maskColor.publicSecond,
            margin: '0 8px',
        },
    },
    priceZone: {
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        margin: '20px 0',
    },
    priceText: {
        fontSize: 36,
        fontWeight: 700,
        color: theme.palette.maskColor.publicMain,
    },
    offerBox: {
        display: 'flex',
        gap: 4,
    },
    fallbackSymbol: {
        color: theme.palette.maskColor.publicMain,
        fontWeight: 700,
        fontSize: 16,
        lineHeight: '20px',
        display: 'flex',
        alignItems: 'flex-end',
    },
    textSm: {
        fontSize: 24,
    },
}))

interface NFTPriceCardProps {
    asset: Web3Helper.NonFungibleAssetScope<void, NetworkPluginID.PLUGIN_EVM>
    topOrder?: NonFungibleTokenOrder<ChainId, SchemaType>
}

export function NFTPriceCard(props: NFTPriceCardProps) {
    const { asset, topOrder } = props
    const { classes, cx } = useStyles()
    const { t } = useI18N()

    const priceTokenImg = asset.priceInToken?.token.logoURL

    return (
        <div className={classes.wrapper}>
            <div className={classes.header}>
                <Typography className={classes.textBase}>{t('price')}</Typography>
                {asset.auction?.endAt && !isZero(asset.auction.endAt) && (
                    <Typography className={classes.textBase}>
                        {t('plugin_collectible_time_left')}
                        {formatDistanceToNow(new Date(asset.auction.endAt * 1000), {
                            addSuffix: true,
                        })}
                    </Typography>
                )}
            </div>
            <div className={classes.priceZone}>
                {(priceTokenImg && <img width={48} height={48} src={priceTokenImg} />) || (
                    <Typography className={classes.fallbackSymbol}>{asset.priceInToken?.token.symbol}</Typography>
                )}
                <Typography className={classes.priceText}>{asset.priceInToken?.amount ?? '-'}</Typography>

                {asset.price?.usd && (
                    <Typography className={cx(classes.priceText, classes.textSm)}>(${asset.price.usd})</Typography>
                )}
            </div>
            {topOrder && (
                <div className={classes.offerBox}>
                    <Typography className={classes.textBase}>{t('plugin_collectible_top_offer')}</Typography>
                    <img width={18} height={18} src={topOrder.priceInToken?.token.logoURL} />
                    <Typography className={classes.textBase}>
                        <strong>{topOrder.priceInToken?.amount ?? '-'}</strong>
                    </Typography>
                    <Typography className={classes.textBase}>
                        <strong>{topOrder.price?.usd ?? '-'}</strong>
                    </Typography>
                </div>
            )}
        </div>
    )
}
