import { HTMLProps, ImgHTMLAttributes, useState } from 'react'
import { LoadingBase, makeStyles } from '@masknet/theme'
import { useTheme } from '@mui/material'
import { useImageURL } from '../../../hooks/useImageURL.js'

const useStyles = makeStyles<Pick<ImageProps, 'size' | 'rounded'>, 'center'>()((theme, { size, rounded }, refs) => ({
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
    center: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    failed: {
        [`&.${refs.center}`]: {
            background:
                theme.palette.mode === 'light'
                    ? 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.9) 100%), linear-gradient(90deg, rgba(98, 152, 234, 0.2) 1.03%, rgba(98, 152, 234, 0.2) 1.04%, rgba(98, 126, 234, 0.2) 100%)'
                    : 'linear-gradient(180deg, #202020 0%, #181818 100%)',
        },
    },
}))

export interface ImageProps
    extends ImgHTMLAttributes<HTMLImageElement>,
        withClasses<'container' | 'fallbackImage' | 'imageLoading'> {
    size?: number | string
    rounded?: boolean
    fallback?: URL | string | JSX.Element
    disableSpinner?: boolean
    containerProps?: HTMLProps<HTMLDivElement>
}

export function Image({
    fallback,
    size,
    rounded,
    disableSpinner,
    classes: extraClasses,
    onClick,
    containerProps,
    ...rest
}: ImageProps) {
    const { classes, cx } = useStyles({ size, rounded }, { props: { classes: extraClasses } })
    const theme = useTheme()
    const [failed, setFailed] = useState(false)

    const { value: imageURL, loading: loadingImageURL } = useImageURL(rest.src)

    if (loadingImageURL && !disableSpinner) {
        return (
            <div {...containerProps} className={cx(classes.container, classes.center, containerProps?.className)}>
                <LoadingBase className={classes.imageLoading} />
            </div>
        )
    }

    if (imageURL && !failed) {
        return (
            <div {...containerProps} className={cx(classes.container, containerProps?.className)}>
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
            </div>
        )
    }
    if (fallback && !(fallback instanceof URL) && typeof fallback !== 'string') {
        return (
            <div
                {...containerProps}
                className={cx(classes.container, classes.failed, classes.center, containerProps?.className)}>
                {fallback}
            </div>
        )
    }

    const fallbackImageURL =
        fallback?.toString() ??
        (theme.palette.mode === 'dark'
            ? new URL('./mask-dark.png', import.meta.url).toString()
            : new URL('./mask-light.png', import.meta.url).toString())

    return (
        <div
            {...containerProps}
            className={cx(classes.container, classes.failed, classes.center, containerProps?.className)}>
            <img
                loading="lazy"
                decoding="async"
                width={size}
                height={size}
                {...rest}
                src={fallbackImageURL}
                className={cx(classes.image, classes.failImage, classes.fallbackImage)}
            />
        </div>
    )
}
