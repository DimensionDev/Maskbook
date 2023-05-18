import { makeStyles, useStylesExtends } from '@masknet/theme'
import { CircularProgress, useTheme } from '@mui/material'
import type { ImgHTMLAttributes } from 'react'
import { useAsync } from 'react-use'

const useStyles = makeStyles()(() => ({}))

interface ImageProps extends ImgHTMLAttributes<HTMLImageElement>, withClasses<'loadingFailImage' | 'root'> {
    fallbackImage?: URL
    useProxy?: boolean
    noLoading?: boolean
}

export function Image({ useProxy = true, noLoading = false, ...rest }: ImageProps) {
    const classes = useStylesExtends(useStyles(), rest)
    const theme = useTheme()
    const maskImageURL =
        theme.palette.mode === 'dark'
            ? new URL('./mask_dark.png', import.meta.url)
            : new URL('./mask_light.png', import.meta.url)
    const { loading, value } = useAsync(async () => {
        if (!rest.src) return
        const data = await globalThis.r2d2Fetch(useProxy ? `https://cors.r2d2.to?${rest.src}` : rest.src)
        return URL.createObjectURL(await data.blob())
    }, [rest.src])

    return (
        <>
            {loading && !noLoading ? (
                <CircularProgress style={{ width: 24, height: 24 }} />
            ) : (
                <img
                    crossOrigin="anonymous"
                    {...rest}
                    src={value ?? rest.src}
                    onError={(event) => {
                        const target = event.currentTarget as HTMLImageElement
                        target.src = (rest.fallbackImage ?? maskImageURL).toString()
                        target.classList.add(classes.loadingFailImage ?? '')
                    }}
                />
            )}
        </>
    )
}
