import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import type { Web3Helper } from '@masknet/plugin-infra/web3'
import { isZero, NonFungibleTokenOrder, formatBalance, formatCurrency } from '@masknet/web3-shared-base'
import { Icons } from '@masknet/icons'
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
            color: theme.palette.maskColor.publicMain,
            margin: '0 2px',
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
    asset: Web3Helper.NonFungibleAssetScope<void>
    topOffer?: NonFungibleTokenOrder<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
}

export function NFTPriceCard(props: NFTPriceCardProps) {
    const { asset, topOffer } = props
    const { classes } = useStyles()
    const { t } = useI18N()

    if (!asset.priceInToken) return null
    const priceTokenImg = (() => {
        const url = asset.priceInToken.token.logoURL
        if (url) {
            return <img width={48} height={48} src={url} />
        }
        if (asset.priceInToken.token.symbol.toUpperCase() === 'WETH') return <Icons.WETH size={48} />
        return <Typography className={classes.fallbackSymbol}>{asset.priceInToken?.token.symbol}</Typography>
    })()

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
                {priceTokenImg}
                <Typography className={classes.priceText}>
                    {asset.priceInToken
                        ? formatBalance(asset.priceInToken.amount, asset.priceInToken.token.decimals || 18, 6)
                        : '-'}
                </Typography>
            </div>
            {topOffer && (
                <div className={classes.offerBox}>
                    <Typography className={classes.textBase}>{t('plugin_collectible_top_offer')}</Typography>
                    {(topOffer.priceInToken?.token.logoURL && (
                        <img width={18} height={18} src={topOffer.priceInToken?.token.logoURL} alt="" />
                    )) ||
                        (topOffer.priceInToken?.token.symbol.toUpperCase() === 'WETH' ? (
                            <Icons.WETH size={18} />
                        ) : (
                            <Typography className={classes.fallbackSymbol}>
                                {topOffer.priceInToken?.token.symbol || topOffer.priceInToken?.token.name}
                            </Typography>
                        ))}
                    <Typography className={classes.textBase}>
                        <strong>
                            {formatBalance(
                                topOffer?.priceInToken?.amount,
                                topOffer?.priceInToken?.token.decimals || 18,
                                6,
                            )}
                        </strong>
                    </Typography>
                    {topOffer.price?.usd && (
                        <Typography className={classes.textBase}>
                            <strong>({formatCurrency(topOffer.price?.usd) || '-'})</strong>
                        </Typography>
                    )}
                </div>
            )}
        </div>
    )
}
