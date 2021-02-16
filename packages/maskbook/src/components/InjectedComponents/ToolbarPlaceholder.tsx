import { useWindowScroll } from 'react-use'

export interface ToolbarPlaceholderProps {
    expectedHeight?: number
    expectedFactor?: number
    style?: React.CSSProperties
}

export function ToolbarPlaceholder(props: ToolbarPlaceholderProps) {
    const { expectedFactor = 1, expectedHeight = 64 } = props
    const { y } = useWindowScroll()

    return (
        <div
            style={{
                height: Math.max(0, ((expectedHeight ?? 64) - y) * expectedFactor),
                ...props.style,
            }}
        />
    )
}
