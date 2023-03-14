import type { FC, HTMLProps } from 'react'

interface ModelViewProps extends HTMLProps<HTMLDivElement> {
    source: string
}

const ModelView: FC<ModelViewProps> = ({ source, ...rest }) => {
    if (!source) return null

    return (
        <div {...rest}>
            <iframe src={source} />
        </div>
    )
}

export default ModelView
