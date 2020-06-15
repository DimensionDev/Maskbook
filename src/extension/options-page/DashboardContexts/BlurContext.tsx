import React, { useMemo, useContext, useEffect, useRef } from 'react'
import { makeStyles, createStyles, useTheme } from '@material-ui/core'

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            position: 'absolute',
            width: '100vw',
            height: '100vh',
        },
        blur: {
            filter: 'blur(3px)',
        },
    }),
)

const DashboardBlurContext = React.createContext<{
    blur(): void
    unblur(): void
}>(null!)

export function useBlurContext(open: boolean) {
    const context = useContext(DashboardBlurContext)
    useEffect(() => (open ? context.blur() : context.unblur()), [context, open])
}

let blurRequest = 0

export interface DashboardBlurContextUIProps {
    children?: React.ReactNode
}

export function DashboardBlurContextUI({ children }: DashboardBlurContextUIProps) {
    const classes = useStyles()
    const ref = useRef<HTMLDivElement>(null!)
    const toggle = useMemo(
        () => ({
            blur: () => {
                blurRequest += 1
                ref.current.classList.add(classes.blur)
            },
            unblur: () => {
                blurRequest -= 1
                if (blurRequest <= 0) ref.current.classList.remove(classes.blur)
            },
        }),
        [classes.blur],
    )
    const theme = useTheme()

    useEffect(() => {
        // global filter blur color fix
        document.body.style.backgroundColor = theme.palette.background.paper
    }, [theme])

    return (
        <DashboardBlurContext.Provider value={toggle}>
            <div className={classes.root} ref={ref}>
                {children}
            </div>
        </DashboardBlurContext.Provider>
    )
}
