import { makeStyles, useStylesExtends } from '@masknet/theme'
import { CircularProgress, useTheme } from '@mui/material'
import type { ImgHTMLAttributes } from 'react'
import { useAsync } from 'react-use'

const useStyles = makeStyles()(() => ({}))

interface ImageProps extends ImgHTMLAttributes<HTMLImageElement>, withClasses<'loadingFailImage'> {}

const assetPlayerFallbackImageDark = new URL('./nft_token_fallback_dark.png', import.meta.url)
const assetPlayerFallbackImageLight = new URL('./nft_token_fallback.png', import.meta.url)

export function Image(props: ImageProps) {
    const { loading, value } = useAsync(async () => {
        if (!props.src) return
        const data = await globalThis.r2d2Fetch(props.src)
        return URL.createObjectURL(await data.blob())
    }, [props.src])
    const classes = useStylesExtends(useStyles(), props)
    const theme = useTheme()
    const fallbackImageURL =
        theme.palette.mode === 'dark' ? assetPlayerFallbackImageDark : assetPlayerFallbackImageLight

    return (
        <>
            {loading ? (
                <CircularProgress size="small" />
            ) : (
                <img
                    {...props}
                    src={value ?? props.src}
                    onError={(event) => {
                        const target = event.currentTarget as HTMLImageElement
                        target.src = fallbackImageURL.toString()
                        target.classList.add(classes.loadingFailImage ?? '')
                    }}
                />
            )}
        </>
    )
}
