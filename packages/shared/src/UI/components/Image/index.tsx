import type { ImgHTMLAttributes } from 'react'
import { useAsync } from 'react-use'
import classNames from 'classnames'
import { makeStyles, parseColor, useStylesExtends } from '@masknet/theme'
import { Box, CircularProgress, useTheme } from '@mui/material'
import { resolveCORSLink, resolveIPFSLink } from '@masknet/web3-shared-base'

const useStyles = makeStyles()((theme) => ({
    circle: {
        color: parseColor(theme.palette.maskColor.main).setAlpha(0.5).toRgbString(),
    },
    failImage: {
        width: 30,
        height: 30,
    },
    spinContainer: {
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
    },
}))

interface ImageProps
    extends ImgHTMLAttributes<HTMLImageElement>,
        withClasses<'fallbackImage' | 'imageLoading' | 'imageLoadingBox'> {
    fallbackImage?: URL
}

export function Image({ fallbackImage, classes: externalClasses, ...rest }: ImageProps) {
    const classes = useStylesExtends(useStyles(), { classes: externalClasses })
    const theme = useTheme()
    const fallbackImageURL = resolveCORSLink(
        resolveIPFSLink(fallbackImage?.toString()) ??
            (theme.palette.mode === 'dark'
                ? new URL('./nft_token_fallback_dark.png', import.meta.url).toString()
                : new URL('./nft_token_fallback.png', import.meta.url)
            ).toString(),
    )

    const { value: image, loading: imageLoading } = useAsync(async () => {
        if (!rest.src) return
        // base64 image
        if (rest.src.startsWith('data')) return rest.src
        const response = await fetch(rest.src, {
            cache: 'force-cache',
        })
        return URL.createObjectURL(await response.blob())
    }, [rest.src])

    if (imageLoading) {
        return (
            <Box className={classes.imageLoadingBox}>
                <Box className={classes.spinContainer}>
                    <CircularProgress
                        variant="determinate"
                        value={100}
                        className={classNames(classes.imageLoading, classes.circle)}
                    />
                    <CircularProgress
                        variant="indeterminate"
                        disableShrink
                        className={classes.imageLoading}
                        sx={{ position: 'absolute', left: 0 }}
                    />
                </Box>
            </Box>
        )
    }

    if (image) {
        return (
            <Box className={classes.imageLoadingBox}>
                <img crossOrigin="anonymous" {...rest} src={image} />
            </Box>
        )
    }

    return (
        <Box className={classes.imageLoadingBox}>
            <img {...rest} src={fallbackImageURL} className={classNames(classes.failImage, classes.fallbackImage)} />
        </Box>
    )
}
