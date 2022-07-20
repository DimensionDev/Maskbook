import { makeStyles } from '@masknet/theme'
import { Skeleton, Typography } from '@mui/material'
import { NFTRank } from './NFTRank'

const useStyles = makeStyles()((theme) => ({
    wrapper: {
        width: '100%',
        boxSizing: 'border-box',
        borderRadius: 12,
    },
    titleBox: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    rankBox: {
        display: 'flex',
    },
    title: {
        fontSize: 20,
        lineHeight: '24px',
        fontWeight: 700,
        marginBottom: 12,
        color: theme.palette.maskColor.main,
    },
    content: {
        width: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 16,
    },
    traitsItem: {
        padding: 12,
        width: 128,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        fontSize: 14,
        lineHeight: '18px',
        color: theme.palette.maskColor.main,
        fontWeight: 700,
        background: theme.palette.maskColor.bg,
        borderRadius: 8,
    },
    traitsTitle: {
        fontWeight: 400,
        color: theme.palette.maskColor.second,
    },
}))
interface NFTPropertiesCardProps {
    asset: any
}

export function NFTPropertiesCard(props: NFTPropertiesCardProps) {
    const { asset } = props
    const { classes } = useStyles()
    const _asset = asset.value
    if (!asset.value || asset.loading) return <Skeleton width="100%" height={96} />
    return (
        <div className={classes.wrapper}>
            <div className={classes.titleBox}>
                <Typography className={classes.title}>Properties</Typography>
                <div className={classes.rankBox}>
                    <NFTRank />
                </div>
            </div>
            <div className={classes.content}>
                {_asset.traits.map((x: any) => {
                    return (
                        <div key={x.type} className={classes.traitsItem}>
                            <Typography className={classes.traitsTitle}>{x.type}</Typography>
                            <Typography>{x.value}</Typography>
                            <Typography>{x.rarity ?? '18,532(19.0%)'}</Typography>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
