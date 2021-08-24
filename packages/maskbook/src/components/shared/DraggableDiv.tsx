import { useRef } from 'react'
import Draggable, { DraggableProps } from 'react-draggable'
import { makeStyles } from '@masknet/theme'
const useStyle = makeStyles()((theme) => ({
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
        [theme.breakpoints.up('sm')]: {
            top: '2em',
            right: '2em',
        },
        [theme.breakpoints.down('sm')]: {
            bottom: '2em',
        },
        maxWidth: 550,
        position: 'fixed',
        pointerEvents: 'initial',
    },
}))

export function DraggableDiv({
    DraggableProps,
    ...props
}: React.HTMLAttributes<HTMLDivElement> & { DraggableProps?: Partial<DraggableProps> }) {
    const { classes } = useStyle()
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
