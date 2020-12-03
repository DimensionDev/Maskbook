interface Props {
    className?: string
}

export const CopyableCode: React.FC<Props> = ({ children, className }) => {
    const onSelect = (event: React.MouseEvent<Node>) => {
        const selection = globalThis.getSelection()
        if (selection === null) {
            return
        }
        const range = globalThis.document.createRange()
        range.selectNode(event.currentTarget)
        selection.removeAllRanges()
        selection.addRange(range)
    }
    const onDeselect = () => {
        globalThis.getSelection()?.removeAllRanges()
    }
    const onCopy = async (event: React.MouseEvent<HTMLElement>) => {
        onSelect(event)
    }
    return (
        <code
            className={className}
            onClick={onCopy}
            onMouseEnter={onSelect}
            onMouseLeave={onDeselect}
            children={children}
        />
    )
}
