import type { FC, HTMLProps } from 'react'
import { AssetPreviewer } from '@masknet/shared'

interface ModelViewProps extends HTMLProps<HTMLDivElement> {
    source: string
}

const ModelView: FC<ModelViewProps> = ({ source, ...rest }) => {
    if (!source) return null

    return (
        <div {...rest}>
            <AssetPreviewer url={source} />
        </div>
    )
}

export default ModelView
