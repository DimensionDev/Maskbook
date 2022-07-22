import { CircularProgress } from '@mui/material'
import type { ImgHTMLAttributes } from 'react'
import { useAsync } from 'react-use'

export function Image(props: ImgHTMLAttributes<HTMLImageElement>) {
    const { loading, value } = useAsync(async () => {
        if (!props.src) return
        const data = await globalThis.r2d2Fetch(props.src)
        return URL.createObjectURL(await data.blob())
    }, [props.src])

    return <>{loading ? <CircularProgress size="small" /> : <img {...props} src={value ?? props.src} />}</>
}
