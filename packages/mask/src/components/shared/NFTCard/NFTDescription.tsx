import { makeStyles } from '@masknet/theme'
import { Skeleton, Typography } from '@mui/material'

const useStyles = makeStyles()((theme) => ({
    wrapper: {
        width: '100%',
        boxSizing: 'border-box',
        borderRadius: 12,
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
        boxSizing: 'border-box',
        padding: 12,
    },
    textContent: {
        fontSize: 14,
        lineHeight: '18px',
        color: theme.palette.maskColor.second,
    },
}))
interface NFTDescriptionProps {
    asset: any
}

export function NFTDescription(props: NFTDescriptionProps) {
    const { asset } = props
    const { classes } = useStyles()
    const _asset = asset.value
    if (!asset.value || asset.loading) return <Skeleton width="100%" height={96} />
    return (
        <div className={classes.wrapper}>
            <Typography className={classes.title}>Description</Typography>
            <div className={classes.content}>
                <Typography className={classes.textContent}>{_asset.metadata.description}</Typography>
            </div>
        </div>
    )
}
