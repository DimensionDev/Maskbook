import { type HTMLProps, type ImgHTMLAttributes, type JSX, useState } from 'react'
import { makeStyles } from '@masknet/theme'
import { useTheme } from '@mui/material'

const useStyles = makeStyles<Pick<ImageProps, 'size' | 'rounded'>, 'center'>()((theme, { size, rounded }, refs) => ({
    optimistic: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    container: {
        width: size ?? '100%',
        height: size ?? '100%',
        position: 'relative',
        borderRadius: rounded ? '50%' : undefined,
        overflow: rounded ? 'hidden' : undefined,
        flexShrink: 0,
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
                theme.palette.mode === 'light' ?
                    'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.9) 100%), linear-gradient(90deg, rgba(98, 152, 234, 0.2) 1.03%, rgba(98, 152, 234, 0.2) 1.04%, rgba(98, 126, 234, 0.2) 100%)'
                :   'linear-gradient(180deg, #202020 0%, #181818 100%)',
        },
    },
}))

const MASK_DARK_FALLBACK = new URL('./mask-dark.png', import.meta.url).href
const MASK_LIGHT_FALLBACK = new URL('./mask-light.png', import.meta.url).href

export interface ImageProps
    extends ImgHTMLAttributes<HTMLImageElement>,
        withClasses<'container' | 'fallbackImage' | 'imageLoading' | 'failed'> {
    size?: number | string
    rounded?: boolean
    fallback?: string | JSX.Element | null
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

    if (rest.src && !failed) {
        return (
            <div {...containerProps} className={cx(classes.container, classes.optimistic, containerProps?.className)}>
                <img
                    className={classes.image}
                    width={size}
                    height={size}
                    {...rest}
                    src={rest.src}
                    onError={(e) => {
                        rest.onError?.(e)
                        setFailed(true)
                    }}
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
                src={fallback?.toString() ?? (theme.palette.mode === 'dark' ? MASK_DARK_FALLBACK : MASK_LIGHT_FALLBACK)}
                className={cx(classes.image, classes.failImage, classes.fallbackImage)}
            />
        </div>
    )
}
