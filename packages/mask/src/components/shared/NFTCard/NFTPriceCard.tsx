import { makeStyles } from '@masknet/theme'
import { Skeleton, Typography } from '@mui/material'
import type { Web3Helper } from '@masknet/plugin-infra/src/web3-helpers'
import type { NetworkPluginID } from '@masknet/web3-shared-base'

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
    asset: {
        loading?: boolean
        value?: Web3Helper.NonFungibleAssetScope<void, NetworkPluginID.PLUGIN_EVM>
    }
}

export function NFTPriceCard(props: NFTPriceCardProps) {
    const { asset } = props
    const { classes } = useStyles()
    if (!asset.value || asset.loading) return <Skeleton width="100%" height={146} />
    const _asset = asset.value
    console.log(_asset, 'ggg')
    const priceTokenImg =
        _asset.priceInToken?.token.logoURL ||
        (_asset.paymentTokens?.length
            ? _asset.paymentTokens[0].logoURL
            : 'https://static.debank.com/image/token/logo_url/eth/935ae4e4d1d12d59a99717a24f2540b5.png')

    return (
        <div className={classes.wrapper}>
            <div className={classes.header}>
                <Typography className={classes.textBase}>Price</Typography>
                <Typography className={classes.textBase}>
                    Time left <strong>-</strong> h <strong>-</strong> m
                </Typography>
            </div>
            <div className={classes.priceZone}>
                <img width={48} height={48} src={priceTokenImg} alt="tokenImg" />
                <Typography className={classes.priceText}>{_asset.priceInToken?.amount ?? '-'}</Typography>
            </div>
            <div className={classes.offerBox}>
                <Typography className={classes.textBase}>Top Offer</Typography>
                <img width={18} height={18} src={priceTokenImg} alt="tokenImg" />
                <Typography className={classes.textBase}>
                    <strong>{_asset.priceInToken?.amount ?? '-'}</strong>
                </Typography>
                <Typography className={classes.textBase}>
                    <strong>(${_asset.price?.usd ?? '-'})</strong>
                </Typography>
            </div>
        </div>
    )
}
