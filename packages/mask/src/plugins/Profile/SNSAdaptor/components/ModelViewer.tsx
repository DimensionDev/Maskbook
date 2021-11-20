import type { CSSProperties } from 'react'
import '@google/model-viewer'

interface ModelViewerProps {
    className: string
    style: CSSProperties
    src: string
}

const ModelViewer = ({ className, style, src }: ModelViewerProps) => {
    return (
        // @ts-ignore
        <model-viewer
            className={className}
            style={style}
            src={src}
            ar
            ar-modes="webxr scene-viewer quick-look"
            environment-image="neutral"
            auto-rotate
            camera-controls
            loading="eager"
        />
    )
}

export default ModelViewer
