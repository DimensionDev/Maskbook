import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import type { Web3Helper } from '@masknet/plugin-infra/src/web3-helpers'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
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
        color: theme.palette.text.secondary,
        '& > strong': {
            color: theme.palette.text.primary,
            margin: '0 8px',
        },
    },
    priceZone: {
        display: 'flex',
        gap: 24,
        margin: '20px 0',
    },
    priceText: {
        fontSize: 36,
        fontWeight: 700,
        color: theme.palette.maskColor.dark,
    },
    offerBox: {
        display: 'flex',
        gap: 4,
    },
}))

interface NFTPriceCardProps {
    asset: Web3Helper.NonFungibleAssetScope<void, NetworkPluginID.PLUGIN_EVM>
}

export function NFTPriceCard(props: NFTPriceCardProps) {
    const { asset } = props
    const { classes } = useStyles()
    const { t } = useI18N()
    const priceTokenImg = asset.priceInToken?.token.logoURL

    return (
        <div className={classes.wrapper}>
            <div className={classes.header}>
                <Typography className={classes.textBase}>{t('price')}</Typography>
                <Typography className={classes.textBase}>
                    {t('plugin_collectible_time_left')} <strong>-</strong> h <strong>-</strong> m
                </Typography>
            </div>
            <div className={classes.priceZone}>
                <img width={48} height={48} src={priceTokenImg} />
                <Typography className={classes.priceText}>{asset.priceInToken?.amount ?? '-'}</Typography>
            </div>
            <div className={classes.offerBox}>
                <Typography className={classes.textBase}>{t('plugin_collectible_top_offer')}</Typography>
                <img width={18} height={18} src={priceTokenImg} />
                <Typography className={classes.textBase}>
                    <strong>{asset.priceInToken?.amount ?? '-'}</strong>
                </Typography>
                <Typography className={classes.textBase}>
                    <strong>(${asset.price?.usd ?? '-'})</strong>
                </Typography>
            </div>
        </div>
    )
}
