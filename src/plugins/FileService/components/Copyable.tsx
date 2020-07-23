import { useSnackbar } from 'notistack'
import React from 'react'

interface Props {
    className?: string
}

export const CopyableCode: React.FC<Props> = ({ children, className }) => {
    const snackbar = useSnackbar()
    const onSelect = (event: React.MouseEvent<Node>) => {
        const selection = global.getSelection()
        const range = global.document.createRange()
        range.selectNode(event.currentTarget)
        selection?.removeAllRanges()
        selection?.addRange(range)
    }
    const onDeselect = () => {
        global.getSelection()?.removeAllRanges()
    }
    const onCopy = (event: React.MouseEvent<Node>) => {
        onSelect(event)
        const success = global.document.execCommand('copy')
        if (!success) {
            return
        }
        snackbar.enqueueSnackbar('File key copied.')
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
