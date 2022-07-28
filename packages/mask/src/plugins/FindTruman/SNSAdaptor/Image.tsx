import { CircularProgress } from '@mui/material'
import type { ImgHTMLAttributes } from 'react'
import { useAsync } from 'react-use'
import { PluginFindTrumanRPC } from '../messages'

export function Image(props: ImgHTMLAttributes<HTMLImageElement>) {
    const { loading, value } = useAsync(async () => {
        if (!props.src) return
        const blob = await PluginFindTrumanRPC.fetchImage(props.src)
        return URL.createObjectURL(blob)
    }, [props.src])

    return (
        <>
            {loading ? (
                <CircularProgress style={{ width: 24, height: 24 }} />
            ) : (
                <img crossOrigin="anonymous" {...props} src={value ?? props.src} />
            )}
        </>
    )
}
