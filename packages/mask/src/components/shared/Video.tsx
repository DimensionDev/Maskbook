import { Skeleton, SkeletonProps } from '@mui/lab'
import { forwardRef, useMemo, useRef } from 'react'
import { useAsync } from 'react-use'
import Services from '../../extension/service'

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

    const { loading, error, value } = useAsync(async () => {
        if (typeof src !== 'string') return src
        return Services.Helper.fetch(src)
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
        <video ref={videoRef} {...VideoProps}>
            {blobURL ? <source src={blobURL} type="video/mp4" /> : null}
        </video>
    )
})
