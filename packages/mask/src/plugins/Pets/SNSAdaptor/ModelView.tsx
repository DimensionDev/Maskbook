import { FC, HTMLProps, useMemo } from 'react'
import { NFTCardStyledAssetPlayer } from '@masknet/shared'

interface ModelViewProps extends HTMLProps<HTMLDivElement> {
    source: string
}

const ModelView: FC<ModelViewProps> = ({ source, ...rest }) => {
    return useMemo(() => {
        if (!source) return null
        return (
            <div {...rest}>
                <NFTCardStyledAssetPlayer url={source} />
            </div>
        )
    }, [source])
}

export default ModelView
