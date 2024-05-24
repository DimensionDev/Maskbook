import { useMemo, useRef } from 'react'
import { useAsync } from 'react-use'
import { Skeleton, type SkeletonProps } from '@mui/lab'
import { fetchBlob } from '@masknet/web3-providers/helpers'

export interface VideoRef {
    video?: HTMLVideoElement | null
}

export interface VideoProps {
    src: string | Blob
    component?: 'video'
    VideoProps?: React.DetailedHTMLProps<React.VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement>
    SkeletonProps?: Partial<SkeletonProps>
}

export function Video(props: VideoProps) {
    const { src, component = 'video', VideoProps, SkeletonProps } = props
    const videoRef = useRef<HTMLVideoElement>(null)

    const { loading, value } = useAsync(async () => {
        if (typeof src !== 'string') return src
        return fetchBlob(src)
    }, [src])

    const blobURL = useMemo(() => {
        if (!value) return ''
        return URL.createObjectURL(value)
    }, [value])

    if (component !== 'video') return null
    if (loading || loading) {
        return <Skeleton variant="rectangular" {...SkeletonProps} />
    }
    return (
        <video ref={videoRef} muted {...VideoProps}>
            {blobURL ?
                <source src={blobURL} type="video/mp4" />
            :   null}
        </video>
    )
}
