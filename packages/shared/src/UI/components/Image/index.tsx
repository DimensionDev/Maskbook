import { ImgHTMLAttributes, useState } from 'react'
import classNames from 'classnames'
import { LoadingBase, makeStyles, parseColor, useStylesExtends } from '@masknet/theme'
import { Box, useTheme } from '@mui/material'
import { useImageURL } from '../../../hooks/useImageURL.js'

const useStyles = makeStyles()((theme) => ({
    container: {},
    circle: {
        color: parseColor(theme.palette.maskColor.main).setAlpha(0.5).toRgbString(),
    },
    image: {
        display: 'block',
    },
    failImage: {
        width: 30,
        height: 30,
    },
    spinContainer: {
        width: 24,
        height: 24,
        inset: 0,
        margin: 'auto',
        position: 'absolute',
    },
}))

interface ImageProps
    extends ImgHTMLAttributes<HTMLImageElement>,
        withClasses<'container' | 'fallbackImage' | 'imageLoading'> {
    fallback?: URL | string | JSX.Element
    disableSpinner?: boolean
}

export function Image({ fallback, disableSpinner, classes: externalClasses, onClick, ...rest }: ImageProps) {
    const classes = useStylesExtends(useStyles(), { classes: externalClasses })
    const theme = useTheme()
    const [failed, setFailed] = useState(false)

    const { value: imageURL, loading: loadingImageURL } = useImageURL(rest.src)

    if (loadingImageURL && !disableSpinner) {
        return (
            <Box className={classes.container}>
                <Box className={classes.spinContainer}>
                    <LoadingBase />
                </Box>
            </Box>
        )
    }

    if (imageURL && !failed) {
        return (
            <Box className={classes.container} onClick={onClick}>
                <img
                    className={classes.image}
                    loading="lazy"
                    decoding="async"
                    {...rest}
                    src={imageURL}
                    onError={() => setFailed(true)}
                />
            </Box>
        )
    }
    if (fallback && !(fallback instanceof URL) && typeof fallback !== 'string') {
        return fallback
    }

    const fallbackImageURL =
        fallback?.toString() ??
        (theme.palette.mode === 'dark'
            ? new URL('./nft_token_fallback_dark.png', import.meta.url).toString()
            : new URL('./nft_token_fallback.png', import.meta.url).toString())

    return (
        <Box className={classes.container} onClick={onClick}>
            <img
                loading="lazy"
                decoding="async"
                {...rest}
                src={fallbackImageURL}
                className={classNames(classes.image, classes.failImage, classes.fallbackImage)}
            />
        </Box>
    )
}
