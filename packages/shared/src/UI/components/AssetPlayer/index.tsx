import { memo, useRef, useCallback } from 'react'
import IframeResizer, { IFrameComponent } from 'iframe-resizer-react'
import { mediaViewerUrl } from '../../../constants'
import { useUpdateEffect } from 'react-use'

interface AssetPlayerProps {
    url: string
    type?: string
    options: {
        autoPlay?: boolean
        controls?: boolean
        playsInline?: boolean
        loop?: boolean
        muted?: boolean
    }
}

//TODO: fallback placeholder when source can't load or gh server be drop
export const AssetPlayer = memo<AssetPlayerProps>(({ url, type, options }) => {
    const ref = useRef<IFrameComponent | null>(null)

    const setIframe = useCallback(() => {
        if (!ref.current) return

        ref.current.iFrameResizer.sendMessage({
            url,
            type,
            ...options,
        })
    }, [url, type, options])

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
            allow="autoplay"
            allowFullScreen
        />
    )
})
