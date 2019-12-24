import React from 'react'
import Paper, { PaperProps } from '@material-ui/core/Paper'
import Draggable from 'react-draggable'

export function DraggablePaper(props: PaperProps) {
    return (
        <Draggable cancel={'[class*="MuiDialogContent-root"]'}>
            <Paper {...props} elevation={5} style={{ border: '1px solid white' }} />
        </Draggable>
    )
}
