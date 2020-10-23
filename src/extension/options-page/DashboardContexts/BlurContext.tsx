import React, { useMemo, useContext, useEffect, useRef, useCallback } from 'react'
import { makeStyles, createStyles, useTheme, useMediaQuery, Theme } from '@material-ui/core'
import { useLocation } from 'react-router-dom'
import { noop } from 'lodash-es'
import { useMatchXS } from '../../../utils/hooks/useMatchXS'
import { GetContext } from '@dimensiondev/holoflows-kit/es'

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
    useEffect(() => {
        // for options page only
        if (GetContext() !== 'options') return
        open ? context.blur() : context.unblur()
    }, [context, open])
}

let blurRequest = 0

export interface DashboardBlurContextUIProps {
    children?: React.ReactNode
}

export function DashboardBlurContextUI({ children }: DashboardBlurContextUIProps) {
    const classes = useStyles()
    const location = useLocation()
    const theme = useTheme()
    const ref = useRef<HTMLDivElement>(null!)
    const xsMatched = useMatchXS()

    const blur = useCallback(() => {
        blurRequest += 1
        ref.current.classList.add(classes.blur)
    }, [classes.blur])
    const unblur = useCallback(() => {
        blurRequest -= 1
        if (blurRequest <= 0) ref.current.classList.remove(classes.blur)
    }, [classes.blur])
    const toggle = useMemo(
        () => ({
            blur,
            unblur,
        }),
        [blur, unblur],
    )

    useEffect(unblur, [location, unblur])
    useEffect(() => {
        // global filter blur color fix
        document.body.style.backgroundColor = theme.palette.background.paper
    }, [theme])

    return (
        <DashboardBlurContext.Provider value={xsMatched ? { blur: noop, unblur: noop } : toggle}>
            <div className={classes.root} ref={ref}>
                {children}
            </div>
        </DashboardBlurContext.Provider>
    )
}
