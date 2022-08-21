import type { ImgHTMLAttributes } from 'react'
import { useAsync } from 'react-use'
import classNames from 'classnames'
import { makeStyles, parseColor, useStylesExtends } from '@masknet/theme'
import { Box, CircularProgress, useTheme } from '@mui/material'
import { useIsImageURL } from '../../../hooks'

const useStyles = makeStyles()((theme) => ({
    circle: {
        color: parseColor(theme.palette.maskColor.main).setAlpha(0.5).toRgbString(),
    },
    failImage: {
        width: 30,
        height: 30,
    },
}))

interface ImageProps
    extends ImgHTMLAttributes<HTMLImageElement>,
        withClasses<'loadingFailImage' | 'imageLoading' | 'imageLoadingBox'> {
    fallbackImage?: URL
}

export function Image({ fallbackImage, ...rest }: ImageProps) {
    const classes = useStylesExtends(useStyles(), rest)
    const theme = useTheme()
    const fallbackImageURL =
        fallbackImage ??
        (theme.palette.mode === 'dark'
            ? new URL('./nft_token_fallback_dark.png', import.meta.url)
            : new URL('./nft_token_fallback.png', import.meta.url))

    const { value: image, loading: imageLoading } = useAsync(async () => {
        if (!rest.src) return
        // base64 image
        if (rest.src.startsWith('data')) return rest.src
        const response = await fetch(rest.src)
        return URL.createObjectURL(await response.blob())
    }, [rest.src])

    const { value: isImageURL, loading: isImageURLLoading } = useIsImageURL(rest.src)

    if (imageLoading || isImageURLLoading) {
        return (
            <Box className={classes.imageLoadingBox}>
                <Box sx={{ position: 'relative' }}>
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

    if (image && isImageURL) {
        return (
            <Box className={classes.imageLoadingBox}>
                <img crossOrigin="anonymous" {...rest} src={image} />
            </Box>
        )
    }

    return (
        <Box className={classes.imageLoadingBox}>
            <img
                {...rest}
                src={fallbackImageURL.toString()}
                className={classNames(classes.failImage, classes.loadingFailImage)}
            />
        </Box>
    )
}
