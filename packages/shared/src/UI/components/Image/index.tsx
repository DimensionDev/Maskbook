import { ImgHTMLAttributes, useEffect, useState } from 'react'
import classNames from 'classnames'
import { LoadingBase, makeStyles, useStylesExtends } from '@masknet/theme'
import { Box, useTheme } from '@mui/material'
import { useImageURL } from '../../../hooks/useImageURL.js'

const useStyles = makeStyles<void, 'floatingContainer'>()((theme, _, refs) => ({
    container: {
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    image: {
        display: 'block',
    },
    failImage: {
        width: 30,
        height: 30,
    },
    floatingContainer: {
        width: '100%',
        height: '100%',
        inset: 0,
        margin: 'auto',
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    failed: {
        [`.${refs.floatingContainer}`]: {
            background:
                theme.palette.mode === 'light'
                    ? 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.9) 100%), linear-gradient(90deg, rgba(98, 152, 234, 0.2) 1.03%, rgba(98, 152, 234, 0.2) 1.04%, rgba(98, 126, 234, 0.2) 100%)'
                    : undefined,
        },
    },
}))

export interface ImageProps
    extends ImgHTMLAttributes<HTMLImageElement>,
        withClasses<'container' | 'fallbackImage' | 'imageLoading'> {
    fallback?: URL | string | JSX.Element
    disableSpinner?: boolean
    setLoadedImageStatus?: (success: boolean) => void
}

export function Image({
    fallback,
    disableSpinner,
    classes: externalClasses,
    onClick,
    setLoadedImageStatus,
    ...rest
}: ImageProps) {
    const classes = useStylesExtends(useStyles(), { classes: externalClasses })
    const theme = useTheme()
    const [failed, setFailed] = useState(false)

    const { value: imageURL, loading: loadingImageURL } = useImageURL(rest.src)
    useEffect(() => setLoadedImageStatus?.(!!imageURL), [imageURL])

    if (loadingImageURL && !disableSpinner) {
        return (
            <Box className={classes.container}>
                <Box className={classes.floatingContainer}>
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
        return (
            <Box className={classNames(classes.container, classes.failed)}>
                <Box className={classes.floatingContainer}>{fallback}</Box>
            </Box>
        )
    }

    const fallbackImageURL =
        fallback?.toString() ??
        (theme.palette.mode === 'dark'
            ? new URL('./mask-dark.png', import.meta.url).toString()
            : new URL('./mask-light.png', import.meta.url).toString())

    return (
        <Box className={classNames(classes.container, classes.failed)} onClick={onClick}>
            <Box className={classes.floatingContainer}>
                <img
                    loading="lazy"
                    decoding="async"
                    {...rest}
                    src={fallbackImageURL}
                    className={classNames(classes.image, classes.failImage, classes.fallbackImage)}
                />
            </Box>
        </Box>
    )
}
