import React, { useState, useCallback } from 'react'
import { Button, CircularProgress, makeStyles, createStyles } from '@material-ui/core'
import type { ButtonProps } from '@material-ui/core/Button'
import CheckIcon from '@material-ui/icons/Check'
import ErrorIcon from '@material-ui/icons/Error'
import { red, green } from '@material-ui/core/colors'
import classNames from 'classnames'
import { useDebounce, useAsyncFn } from 'react-use'

const circle = <CircularProgress size={18} />

enum ThrottledButtonState {
    Normal = 1,
    Clicked,
    Loading,
}

interface ThrottledButtonProps extends Omit<ButtonProps, 'color' | 'onClick'> {
    color: ButtonProps['color'] | 'danger'
    onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => unknown
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
function useDebounceAsync<T extends any[]>(
    asyncFn: (...args: T) => unknown,
): { loading: boolean; disabled: boolean; f(...args: T): void } {
    // useAsyncFn use T | [] as it's parameter where is conflict with our usage.
    // We should ensure always call startAsyncFn with parameters.
    const [state, startAsyncFn] = useAsyncFn<void, T>(asyncFn as any, [], { loading: false, value: undefined })
    // Sync the debounce state after 500ms
    const [debounceLoading, setDebounceLoading] = useState(false)
    useDebounce(() => setDebounceLoading(state.loading), 500, [state])
    const f = useCallback(
        (...args: T) => {
            if (!state.loading) {
                setDebounceLoading(false)
                startAsyncFn(...args)
            }
        },
        [startAsyncFn, state.loading],
    )
    // loading 0ms to 500ms: disabled, !loading
    // loading 500ms+: disabled, loading
    if (state.loading) return { f, disabled: true, loading: debounceLoading }
    // The debounceLoading is invalidated, refresh it now (instead of waiting for 500ms)
    if (debounceLoading) setDebounceLoading(false)
    // If the task is not running, ignore the throttledLoading
    return { disabled: false, loading: false, f }
}
export function ThrottledButton(_props: ThrottledButtonProps) {
    const { onClick, color, ...props } = _props
    const classes = useDangerStyles()
    const { f, loading } = useDebounceAsync(onClick)
    return (
        <Button
            startIcon={loading ? circle : undefined}
            disabled={loading}
            onClick={f}
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
