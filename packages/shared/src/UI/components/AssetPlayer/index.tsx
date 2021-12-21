import { memo, useRef, DetailedHTMLProps, AudioHTMLAttributes, VideoHTMLAttributes, useCallback } from 'react'
import IframeResizer, { IFrameComponent, IFrameObject } from 'iframe-resizer-react'
import { mediaViewerUrl } from '../../../constants'
import { useUpdateEffect } from 'react-use'

interface AssetPlayerProps {
    url: string
    type?: string
    AudioProps?: DetailedHTMLProps<AudioHTMLAttributes<HTMLAudioElement>, HTMLAudioElement>
    VideoProps?: DetailedHTMLProps<VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement>
}

//TODO: fallback placeholder when source can't load or gh server be drop
export const AssetPlayer = memo<AssetPlayerProps>(({ url, type, AudioProps, VideoProps }) => {
    const ref = useRef<IFrameComponent | null>(null)

    const setIframe = useCallback(() => {
        if (!ref.current) return

        let mediaOption = {}
        if ((type?.includes('audio') || /\.(mp3|wav|flac|aac)$/.test(url)) && AudioProps) mediaOption = AudioProps
        else if ((type?.startsWith('video') || /\.(mp4|av1|webm)$/.test(url)) && VideoProps) mediaOption = VideoProps

        ref.current.iFrameResizer.sendMessage({
            url,
            type,
            ...mediaOption,
        })
    }, [url, type, AudioProps, VideoProps])

    useUpdateEffect(() => {
        setIframe()
    }, [setIframe])

    return (
        <IframeResizer
            src={mediaViewerUrl}
            onInit={(iframe: IFrameComponent) => {
                ref.current = iframe
                setIframe()
            }}
            checkOrigin={false}
            frameBorder="0"
        />
    )
})
