import { forwardRef, useMemo, useRef } from 'react'
import { useAsync } from 'react-use'
import { Skeleton, type SkeletonProps } from '@mui/lab'
import Services from '../../extension/service.js'

export interface VideoRef {
    video?: HTMLVideoElement | null
}

export interface VideoProps {
    src: string | Blob
    component?: 'video'
    VideoProps?: React.DetailedHTMLProps<React.VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement>
    SkeletonProps?: Partial<SkeletonProps>
}

export const Video = forwardRef<VideoRef, VideoProps>(function Video(props, outgoingRef) {
    const { src, component = 'video', VideoProps, SkeletonProps } = props
    const videoRef = useRef<HTMLVideoElement>(null)

    const { loading, value } = useAsync(async () => {
        if (typeof src !== 'string') return src
        return Services.Helper.fetchBlob(src)
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
            {blobURL ? <source src={blobURL} type="video/mp4" /> : null}
        </video>
    )
})
