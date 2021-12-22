import type { ERC721TokenDetailed } from '@masknet/web3-shared-evm'
import { CircularProgress } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'

const useStyles = makeStyles()((theme) => ({
    imgWrapper: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 160,
        width: 120,
        overflow: 'hidden',
    },
    loadingNftImg: {
        marginTop: 20,
    },
    selectWrapperImg: {
        maxWidth: '100%',
        minHeight: 160,
    },
    fallbackNftImg: {
        width: 64,
        height: 64,
        transform: 'translateY(10px)',
    },
}))

interface NftImageProps extends withClasses<'loadingFailImage'> {
    token: ERC721TokenDetailed | undefined
    fallbackImage: URL
}
export function NftImage(props: NftImageProps) {
    const { token, fallbackImage } = props
    const classes = useStylesExtends(useStyles(), props)

    return (
        <div className={classes.imgWrapper}>
            {!token?.info.hasTokenDetailed ? (
                <CircularProgress size={20} className={classes.loadingNftImg} />
            ) : token?.info.mediaUrl ? (
                <img
                    className={classes.selectWrapperImg}
                    src={token?.info.mediaUrl}
                    onError={(event) => {
                        const target = event.target as HTMLImageElement
                        target.src = fallbackImage.toString()
                        target.classList.add(classes.loadingFailImage ?? '')
                    }}
                />
            ) : (
                <img className={classes.fallbackNftImg} src={fallbackImage.toString()} />
            )}
        </div>
    )
}
