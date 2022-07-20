import { makeStyles } from '@masknet/theme'
import { Skeleton, Typography } from '@mui/material'

const useStyles = makeStyles()((theme) => ({
    wrapper: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: 12,
        boxSizing: 'border-box',
        gap: 8,
        borderRadius: 12,
        background: '#F9F9F9',
    },
    listItem: {
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
    },
    textBase: {
        fontSize: 14,
        color: theme.palette.text.secondary,
    },
    listItemContent: {
        maxWidth: '30%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        display: 'flex',
        gap: 6,
    },
}))

interface NFTInfoCardProps {
    asset: any
}

export function NFTInfoCard(props: NFTInfoCardProps) {
    const { asset } = props
    const { classes } = useStyles()
    if (!asset.value || asset.loading) return <Skeleton width="100%" height={172} />
    const _asset = asset.value
    const infoConfigMapping = [
        { title: 'Token ID', value: _asset.tokenId },
        { title: 'Contract', value: _asset.address },
        { title: 'Blockchain', value: 'Ethereum' },
        { title: 'Token Standard', value: 'ERC721' },
        { title: 'Creator Royalties', value: '5.0%' },
        { title: 'OpenSea Platform costs', value: '2%' },
    ]
    return (
        <div className={classes.wrapper}>
            {infoConfigMapping.map((x) => {
                return (
                    <div key={x.title} className={classes.listItem}>
                        <Typography className={classes.textBase}>{x.title}</Typography>
                        <div className={classes.listItemContent}>{x.value}</div>
                    </div>
                )
            })}
        </div>
    )
}
