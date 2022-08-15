import { makeStyles, parseColor, useStylesExtends } from '@masknet/theme'
import { Box, CircularProgress, useTheme } from '@mui/material'
import classNames from 'classnames'
import type { ImgHTMLAttributes } from 'react'
import { useAsync } from 'react-use'
import { useImageChecker } from '../../../hooks'

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
    const maskImageURL =
        theme.palette.mode === 'dark'
            ? new URL('./mask_dark.png', import.meta.url)
            : new URL('./mask_light.png', import.meta.url)

    const { loading: loadingImage, value: image } = useAsync(async () => {
        if (!rest.src) return
        const data = await globalThis.r2d2Fetch(`https://cors.r2d2.to?${rest.src}`)
        return URL.createObjectURL(await data.blob())
    }, [rest.src])

    const { value: isImageToken, loading: checkImageTokenLoading } = useImageChecker(rest.src)

    return (
        <>
            {loadingImage || checkImageTokenLoading ? (
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
            ) : isImageToken ? (
                <img
                    crossOrigin="anonymous"
                    {...rest}
                    src={image ?? rest.src}
                    onError={(event) => {
                        const target = event.currentTarget as HTMLImageElement
                        target.src = (fallbackImage ?? maskImageURL).toString()
                        target.classList.add(classes.loadingFailImage ?? '')
                    }}
                />
            ) : (
                <Box className={classes.imageLoadingBox}>
                    <img
                        {...rest}
                        src={(fallbackImage ?? maskImageURL).toString()}
                        className={classNames(classes.failImage, classes.loadingFailImage)}
                    />
                </Box>
            )}
        </>
    )
}
