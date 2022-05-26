import { Button, ButtonProps, CircularProgress } from '@mui/material'
import ErrorIcon from '@mui/icons-material/Error'
import CheckIcon from '@mui/icons-material/Check'
import { useState } from 'react'
import classNames from 'classnames'
import { useUpdateEffect } from 'react-use'
import { makeStyles } from '@masknet/theme'
import { green, red } from '@mui/material/colors'

export interface ActionButtonProps extends ButtonProps {
    width?: number | string
    loading?: boolean
    component?: keyof JSX.IntrinsicElements | React.ComponentType<any>
}
const circle = <CircularProgress color="inherit" size={18} />

export default function ActionButton<T extends React.ComponentType<any> = React.ComponentType<{}>>(
    props: ActionButtonProps & PropsOf<T>,
) {
    const { width, loading, children, className, style, ...rest } = props
    return (
        <Button
            disableElevation
            disabled={loading}
            startIcon={loading && circle}
            className={'actionButton ' + className}
            style={{ width, ...style }}
            children={children}
            {...rest}
        />
    )
}

export interface ActionButtonPromiseProps extends ButtonProps {
    executor: () => Promise<void>
    init: React.ReactChild
    complete: React.ReactChild
    completeOnClick?: 'use executor' | (() => void)
    waiting: React.ReactChild
    waitingOnClick?: () => ActionButtonPromiseState
    failed?: React.ReactChild
    failedOnClick?: 'use executor' | (() => void)
    completeIcon?: React.ReactNode
    failIcon?: React.ReactNode
    onComplete?: () => void
    noUpdateEffect?: boolean
}
type ActionButtonPromiseState = 'init' | 'complete' | 'wait' | 'fail'
export function ActionButtonPromise(props: ActionButtonPromiseProps) {
    const { classes } = useStyles()
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
        completeIcon = <CheckIcon />,
        failIcon = <ErrorIcon />,
        ...b
    } = props

    const [state, setState] = useState<ActionButtonPromiseState>('init')
    const completeClass = classNames(classes.success, b.className)
    const failClass = classNames(classes.failed, b.className)

    const run = () => {
        setState('wait')
        executor().then(
            () => {
                setState('complete')
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
        return <Button {...b} startIcon={circle} disabled={!waitingOnClick} children={waiting} onClick={cancel} />
    if (state === 'complete')
        return (
            <Button
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
            <Button
                {...b}
                disabled={!failClick}
                startIcon={failIcon}
                children={failed}
                className={failClass}
                onClick={failClick}
            />
        )
    return <Button {...b} children={init} onClick={run} />
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
