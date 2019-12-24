import React from 'react'
import Paper, { PaperProps } from '@material-ui/core/Paper'
import Draggable from 'react-draggable'

export function DraggablePaper(props: PaperProps) {
    return (
        <Draggable bounds="parent">
            <Paper
                {...props}
                elevation={5}
                style={{
                    border: '1px solid white',
                    maxWidth: 350,
                    position: 'fixed',
                    top: '2em',
                    right: '2em',
                    zIndex: 9999999,
                }}
            />
        </Draggable>
    )
}
