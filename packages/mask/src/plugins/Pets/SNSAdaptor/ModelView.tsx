import type { FC, HTMLProps } from 'react'
import '@webcomponents/custom-elements'
import '@google/model-viewer/dist/model-viewer'
import { Punk3D } from '../constants'

interface ModelViewElementProps extends HTMLProps<HTMLDivElement> {
    'shadow-intensity': string
    'camera-controls': boolean
    'auto-rotate': boolean
    ar: boolean
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'model-viewer': any
        }
    }
}

interface ModelViewProps extends HTMLProps<HTMLDivElement> {
    source: string
}

const ModelView: FC<ModelViewProps> = ({ source, ...rest }) => {
    return (
        <div {...rest}>
            <model-viewer
                style={{ width: '90%', height: '100%', top: source === Punk3D.url ? '5%' : 0, margin: 'auto' }}
                src={source}
                shadow-intensity="1"
                camera-controls
                auto-rotate
                ar
            />
        </div>
    )
}

export default ModelView
