import { makeStyles } from '@masknet/theme'
import { Skeleton } from '@mui/material'

const useStyles = makeStyles()((theme) => ({
    wrapper: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        padding: 8,
        boxSizing: 'border-box',
        gap: 12,
        borderRadius: 8,
        background: theme.palette.maskColor.bottom,
        boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.05)',
    },
    offerDetail: {},
}))

interface NFTActivityCardProps {
    asset: any
}

export function NFTActivityCard(props: NFTActivityCardProps) {
    const { asset } = props
    const { classes } = useStyles()
    if (!asset.value || asset.loading) return <Skeleton width="100%" height={60} />
    const _asset = asset.value

    return <div className={classes.wrapper}>222</div>
}
