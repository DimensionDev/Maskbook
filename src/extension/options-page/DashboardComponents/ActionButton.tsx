import React, { useState, useCallback } from 'react'
import { Button, CircularProgress, makeStyles, createStyles } from '@material-ui/core'
import type { ButtonProps } from '@material-ui/core/Button'
import CheckIcon from '@material-ui/icons/Check'
import ErrorIcon from '@material-ui/icons/Error'
import { red, green } from '@material-ui/core/colors'
import classNames from 'classnames'

const circle = <CircularProgress size={18} />

enum ThrottledButtonState {
    Normal = 1,
    Clicked,
    Loading,
}

interface ThrottledButtonProps extends Omit<ButtonProps, 'color'> {
    color: ButtonProps['color'] | 'danger'
}

const useDangerStyles = makeStyles((theme) =>
    createStyles({
        containedPrimary: {
            backgroundColor: 'rgb(244, 99, 125)',
            '&:hover': {
                backgroundColor: 'rgb(235, 71, 101)',
            },
        },
        outlinedPrimary: {
            borderColor: 'rgb(244, 99, 125)',
            color: 'rgb(244, 99, 125)',
            '&:hover': {
                borderColor: 'rgb(235, 71, 101)',
            },
        },
    }),
)

export function ThrottledButton(_props: ThrottledButtonProps) {
    const { onClick, color, ...props } = _props
    const [loading, setLoading] = useState<{ state: ThrottledButtonState; timer?: number }>({
        state: ThrottledButtonState.Normal,
    })
    const classes = useDangerStyles()
    const hookedClick = useCallback(
        (e) => {
            e.stopPropagation()
            if (loading.state !== ThrottledButtonState.Normal) return
            setLoading({ state: ThrottledButtonState.Clicked })
            const timer: number = window.setTimeout(
                () => setLoading({ state: ThrottledButtonState.Loading, timer }),
                500,
            )
            return Promise.resolve(e)
                .then(onClick)
                .finally(() => {
                    window.clearTimeout(timer)
                    setLoading({ state: ThrottledButtonState.Normal })
                })
        },
        [loading.state, onClick],
    )
    return (
        <Button
            startIcon={loading.state === ThrottledButtonState.Loading ? circle : undefined}
            disabled={loading.state === ThrottledButtonState.Loading}
            onClick={hookedClick}
            classes={color === 'danger' ? classes : undefined}
            color={color === 'danger' ? 'primary' : color}
            {...props}></Button>
    )
}

interface ActionButtonProps extends ButtonProps, PropsOf<typeof Button> {
    width?: number | string
    loading?: boolean
    component?: keyof JSX.IntrinsicElements | React.ComponentType<any>
}

export default function ActionButton<T extends React.ComponentType<any> = React.ComponentType<{}>>(
    props: ActionButtonProps & PropsOf<T>,
) {
    const { width, loading, children, className, style, ...p } = props
    return (
        <Button
            disableElevation
            disabled={loading}
            startIcon={loading && circle}
            className={'actionButton ' + className}
            style={{ width, ...style }}
            children={children}
            {...p}></Button>
    )
}

interface ActionButtonPromiseProps extends ButtonProps {
    executor: () => Promise<void>
    init: React.ReactChild
    complete: React.ReactChild
    completeOnClick?: 'use executor' | (() => void)
    waiting: React.ReactChild
    waitingOnClick?: () => ActionButtonPromiseState
    failed: React.ReactChild
    failedOnClick?: 'use executor' | (() => void)
}
type ActionButtonPromiseState = 'init' | 'complete' | 'wait' | 'fail'
export function ActionButtonPromise(props: ActionButtonPromiseProps) {
    const classes = useStyles()
    const { executor, complete, failed, waiting, init, completeOnClick, waitingOnClick, failedOnClick, ...b } = props

    const [state, setState] = React.useState<ActionButtonPromiseState>('init')
    const completeClass = classNames(classes.success, b.className)
    const failClass = classNames(classes.failed, b.className)

    const run = () => {
        setState('wait')
        executor().then(
            () => setState('complete'),
            () => setState('fail'),
        )
    }
    const cancel = () => {
        const p = waitingOnClick?.()
        p && setState(p)
    }
    const completeClick = completeOnClick === 'use executor' ? run : completeOnClick
    const failClick = failedOnClick === 'use executor' ? run : failedOnClick
    if (state === 'wait')
        return <Button {...b} startIcon={circle} disabled={!waitingOnClick} children={waiting} onClick={cancel} />
    if (state === 'complete')
        return (
            <Button
                {...b}
                disabled={!completeClick}
                startIcon={<CheckIcon />}
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
                startIcon={<ErrorIcon />}
                children={failed}
                className={failClass}
                onClick={failClick}
            />
        )
    return <Button {...b} children={init} onClick={run} />
}
const useStyles = makeStyles({
    success: {
        backgroundColor: green[500],
        '&:hover': {
            backgroundColor: green[700],
        },
    },
    failed: {
        backgroundColor: red[500],
        '&:hover': {
            backgroundColor: red[700],
        },
    },
})
