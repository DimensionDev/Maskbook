import React from 'react'
import Paper, { PaperProps } from '@material-ui/core/Paper'
import Draggable from 'react-draggable'
import { makeStyles, Theme } from '@material-ui/core'

const useStyle = makeStyles((theme: Theme) => ({
    root: {
        position: 'fixed',
        width: '100vw',
        height: '100vh',
        top: 0,
        left: 0,
        zIndex: 9999,
        pointerEvents: 'none',
    },
    paper: {
        maxWidth: 350,
        position: 'fixed',
        top: '2em',
        right: '2em',
        pointerEvents: 'initial',
        outline: theme.palette.type === 'dark' ? '1px solid rgba(255, 255, 255, 0.5)' : undefined,
    },
}))
export function DraggablePaper(props: PaperProps) {
    const classes = useStyle()
    return (
        <div className={classes.root}>
            <Draggable bounds="parent" cancel="input, button, address" handle="nav">
                <Paper {...props} elevation={10} className={classes.paper} />
            </Draggable>
        </div>
    )
}
