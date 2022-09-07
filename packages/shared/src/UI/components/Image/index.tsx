import { makeStyles, parseColor, useStylesExtends } from '@masknet/theme'
import { resolveCORSLink, resolveIPFSLink } from '@masknet/web3-shared-base'
import { Box, CircularProgress, useTheme } from '@mui/material'
import classNames from 'classnames'
import { ImgHTMLAttributes, useState } from 'react'
import { useAsync } from 'react-use'
import { loadImage } from './loadImage'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
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
        withClasses<'container' | 'fallbackImage' | 'imageLoading'> {
    fallback?: URL | string | JSX.Element
    disableSpinner?: boolean
}

export function Image({ fallback, disableSpinner, classes: externalClasses, ...rest }: ImageProps) {
    const classes = useStylesExtends(useStyles(), { classes: externalClasses })
    const theme = useTheme()
    const [failed, setFailed] = useState(false)

    const { value: image, loading: imageLoading } = useAsync(async () => {
        if (!rest.src) return
        return loadImage(rest.src)
    }, [rest.src])

    if (imageLoading && !disableSpinner) {
        return (
            <Box className={classes.container}>
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

    if (image && !failed) {
        return (
            <Box className={classes.container}>
                <img loading="lazy" decoding="async" {...rest} src={image} onError={() => setFailed(true)} />
            </Box>
        )
    }
    if (fallback && !(fallback instanceof URL) && typeof fallback !== 'string') {
        return fallback
    }

    const fallbackImageURL = resolveCORSLink(
        resolveIPFSLink(fallback?.toString()) ??
            (theme.palette.mode === 'dark'
                ? new URL('./nft_token_fallback_dark.png', import.meta.url).toString()
                : new URL('./nft_token_fallback.png', import.meta.url)
            ).toString(),
    )

    return (
        <Box className={classes.container}>
            <img
                loading="lazy"
                decoding="async"
                {...rest}
                src={fallbackImageURL}
                className={classNames(classes.failImage, classes.fallbackImage)}
            />
        </Box>
    )
}
