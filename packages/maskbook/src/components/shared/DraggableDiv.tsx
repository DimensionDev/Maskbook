import React, { useRef } from 'react'
import Draggable, { DraggableProps } from 'react-draggable'
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
        maxWidth: 550,
        position: 'fixed',
        top: '2em',
        right: '2em',
        pointerEvents: 'initial',
    },
}))

export function DraggableDiv({
    DraggableProps,
    ...props
}: React.HTMLAttributes<HTMLDivElement> & { DraggableProps?: Partial<DraggableProps> }) {
    const classes = useStyle()
    const ref = useRef<HTMLDivElement>(null)
    return (
        <div className={classes.root}>
            <Draggable
                // @ts-ignore
                nodeRef={ref}
                bounds="parent"
                cancel="p, h1, input, button, address"
                handle="nav"
                {...DraggableProps}>
                <div {...props} ref={ref} className={classes.paper} />
            </Draggable>
        </div>
    )
}
