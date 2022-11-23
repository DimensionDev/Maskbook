import { ImgHTMLAttributes, useState } from 'react'
import { LoadingBase, makeStyles } from '@masknet/theme'
import { Box, useTheme } from '@mui/material'
import { useImageURL } from '../../../hooks/useImageURL.js'

const useStyles = makeStyles<Pick<ImageProps, 'size' | 'rounded'>, 'floatingContainer'>()(
    (theme, { size, rounded }, refs) => ({
        container: {
            width: size ?? '100%',
            height: size ?? '100%',
            position: 'relative',
            borderRadius: rounded ? '50%' : undefined,
            overflow: rounded ? 'hidden' : undefined,
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
                        : 'linear-gradient(180deg, #202020 0%, #181818 100%)',
            },
        },
    }),
)

export interface ImageProps
    extends ImgHTMLAttributes<HTMLImageElement>,
        withClasses<'container' | 'fallbackImage' | 'imageLoading'> {
    size?: number | string
    rounded?: boolean
    fallback?: URL | string | JSX.Element
    disableSpinner?: boolean
}

export function Image({
    fallback,
    size,
    rounded,
    disableSpinner,
    classes: extraClasses,
    onClick,
    ...rest
}: ImageProps) {
    const { classes, cx } = useStyles({ size, rounded }, { props: { classes: extraClasses } })
    const theme = useTheme()
    const [failed, setFailed] = useState(false)

    const { value: imageURL, loading: loadingImageURL } = useImageURL(rest.src)

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
                    width={size}
                    height={size}
                    {...rest}
                    src={imageURL}
                    onError={() => setFailed(true)}
                />
            </Box>
        )
    }
    if (fallback && !(fallback instanceof URL) && typeof fallback !== 'string') {
        return (
            <Box className={cx(classes.container, classes.failed)}>
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
        <Box className={cx(classes.container, classes.failed)} onClick={onClick}>
            <Box className={classes.floatingContainer}>
                <img
                    loading="lazy"
                    decoding="async"
                    width={size}
                    height={size}
                    {...rest}
                    src={fallbackImageURL}
                    className={cx(classes.image, classes.failImage, classes.fallbackImage)}
                />
            </Box>
        </Box>
    )
}
