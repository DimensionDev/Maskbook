import React from 'react'
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
    },
}))
export function DraggablePaper(props: React.HTMLAttributes<HTMLDivElement>) {
    const classes = useStyle()
    return (
        <div className={classes.root}>
            <Draggable bounds="parent" cancel="input, button, address" handle="nav">
                <div {...props} className={classes.paper} />
            </Draggable>
        </div>
    )
}
