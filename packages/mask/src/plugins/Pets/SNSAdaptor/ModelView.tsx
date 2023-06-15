import type { HTMLProps } from 'react'

interface ModelViewProps extends HTMLProps<HTMLDivElement> {
    source: string
}

function ModelView({ source, ...rest }: ModelViewProps) {
    if (!source) return null

    return (
        <div {...rest}>
            <iframe src={source} />
        </div>
    )
}

export default ModelView
