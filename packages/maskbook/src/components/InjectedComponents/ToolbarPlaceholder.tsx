import { useWindowScroll } from 'react-use'
import { TOOLBAR_HEIGHT } from './Toolbar'

export interface ToolbarPlaceholderProps {
    expectedHeight?: number
    style?: React.CSSProperties
}

export function ToolbarPlaceholder(props: ToolbarPlaceholderProps) {
    const { expectedHeight = TOOLBAR_HEIGHT } = props
    const { y } = useWindowScroll()

    return (
        <div
            style={{
                // the height of the placeholder was calculated dynamically according to the scroll position.
                // this will be inserted into any fixed position components to simulate a scrolling effect on a fixed element.
                height: Math.max(0, expectedHeight - y),
                ...props.style,
            }}
        />
    )
}
