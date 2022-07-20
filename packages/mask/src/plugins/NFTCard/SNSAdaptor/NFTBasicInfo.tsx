import { NFTCardStyledAssetPlayer } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { Skeleton, Typography } from '@mui/material'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
interface NFTBasicInfoProps {
    asset: any
}

const useStyles = makeStyles()((theme) => ({
    layout: {
        width: 300,
        display: 'flex',
        flexDirection: 'column',
    },
    body: {
        width: '100%',
        marginBottom: 36,
    },
    player: {
        width: 300,
        height: 300,
        border: 'none',
    },
    errorPlaceholder: {
        padding: '82px 0',
        backgroundColor: theme.palette.background.default,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        width: '100%',
    },
    loadingPlaceholder: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        padding: '74px 0',
    },
    loadingIcon: {
        width: 36,
        height: 52,
    },
    errorIcon: {
        width: 36,
        height: 36,
    },
    iframe: {
        minWidth: 300,
        minHeight: 300,
    },
    imgWrapper: {
        minWidth: 300,
        minHeight: 300,
        background: 'black',
        borderRadius: 20,
        '& > img': {
            borderRadius: 20,
        },
    },
    nameSm: {
        fontSize: 16,
        fontWeight: 700,
    },
    nameLg: {
        fontSize: 20,
        fontWeight: 700,
    },
    nameLgBox: {
        display: 'flex',
        placeSelf: 'center',
        gap: 6,
        marginTop: 12,
    },
}))

export function NFTBasicInfo(props: NFTBasicInfoProps) {
    const { asset } = props
    const { classes } = useStyles()
    if (!asset.value || asset.loading) return <Skeleton width={300} height={300} />

    const _asset = asset.value
    const resourceUrl = _asset.metadata?.imageURL ?? _asset.metadata?.mediaURL
    return (
        <div className={classes.layout}>
            <div className={classes.body}>
                <NFTCardStyledAssetPlayer url={resourceUrl} classes={classes} isNative={false} />
            </div>
            <Typography className={classes.nameSm}>{_asset.metadata.name + '#' + _asset.tokenId}</Typography>
            <div className={classes.nameLgBox}>
                <Typography className={classes.nameLg}>{_asset.metadata.name}</Typography>
                {_asset.collection?.verified && <VerifiedUserIcon color="primary" fontSize="small" />}
            </div>
        </div>
    )
}
