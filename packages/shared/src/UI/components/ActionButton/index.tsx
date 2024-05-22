import { useState } from 'react'
import { CircularProgress } from '@mui/material'
import { makeStyles, ActionButton } from '@masknet/theme'
import type { ButtonProps } from '@mui/material/Button'
import { Check as CheckIcon, Error as ErrorIcon } from '@mui/icons-material'
import { red, green } from '@mui/material/colors'
import { useUpdateEffect } from 'react-use'

const circle = <CircularProgress color="inherit" size={18} />

export interface ActionButtonPromiseProps extends ButtonProps {
    executor: () => Promise<ActionButtonPromiseState | undefined | void>
    init: React.ReactNode
    complete: React.ReactNode
    completeOnClick?: 'use executor' | (() => void)
    waiting: React.ReactNode
    waitingOnClick?: () => ActionButtonPromiseState
    failed?: React.ReactNode
    failedButtonStyle?: string
    failedOnClick?: 'use executor' | (() => void)
    completeIcon?: React.ReactNode
    failIcon?: React.ReactNode
    waitingIcon?: React.ReactNode
    onComplete?: () => void
    noUpdateEffect?: boolean
}
type ActionButtonPromiseState = 'init' | 'complete' | 'wait' | 'fail'
const check = <CheckIcon />
const fail = <ErrorIcon />
export function ActionButtonPromise(props: ActionButtonPromiseProps) {
    const { classes, cx } = useStyles()
    const {
        executor,
        complete,
        failed,
        waiting,
        init,
        completeOnClick,
        waitingOnClick,
        failedOnClick,
        onComplete,
        noUpdateEffect,
        completeIcon = check,
        failIcon = fail,
        waitingIcon = circle,
        failedButtonStyle,
        ...b
    } = props

    const [state, setState] = useState<ActionButtonPromiseState>('init')
    const completeClass = cx(classes.success, b.className)
    const failClass = cx(classes.failed, b.className)

    const run = () => {
        setState('wait')
        executor().then(
            (status?: ActionButtonPromiseState | void) => {
                setState(status ?? 'complete')
                onComplete?.()
            },
            (error) => {
                if (error.message.includes('Switch Chain Error')) setState('init')
                else setState('fail')
            },
        )
    }
    const cancel = () => {
        const p = waitingOnClick?.()
        p && setState(p)
    }
    const completeClick = completeOnClick === 'use executor' ? run : completeOnClick
    const failClick = failedOnClick === 'use executor' ? run : failedOnClick

    useUpdateEffect(() => {
        if (!noUpdateEffect) {
            setState((prev) => (prev === 'init' ? prev : 'init'))
        }
    }, [executor, noUpdateEffect])

    if (state === 'wait')
        return <ActionButton {...b} loading disabled={!waitingOnClick} children={waiting} onClick={cancel} />
    if (state === 'complete')
        return (
            <ActionButton
                {...b}
                disabled={!completeClick}
                startIcon={completeIcon}
                children={complete}
                className={completeClass}
                onClick={completeClick}
            />
        )
    if (state === 'fail')
        return (
            <ActionButton
                {...b}
                disabled={!failClick}
                startIcon={failIcon}
                children={failed}
                className={failedButtonStyle || failClass}
                onClick={failClick}
            />
        )
    return <ActionButton {...b} children={init} onClick={run} />
}
const useStyles = makeStyles()({
    success: {
        color: '#fff',
        backgroundColor: green[500],
        '&:hover': {
            backgroundColor: green[700],
        },
    },
    failed: {
        backgroundColor: red[500],
        color: '#fff',
        '&:hover': {
            backgroundColor: red[700],
        },
    },
})
