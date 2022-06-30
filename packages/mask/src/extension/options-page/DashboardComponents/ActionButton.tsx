import { useState, useCallback } from 'react'
import { Box, Button, CircularProgress } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import type { ButtonProps } from '@mui/material/Button'
import CheckIcon from '@mui/icons-material/Check'
import ErrorIcon from '@mui/icons-material/Error'
import { red, green } from '@mui/material/colors'
import classNames from 'classnames'
import { useDebounce, useAsyncFn, useUpdateEffect } from 'react-use'
import { useErrorStyles } from '../../../utils/theme'
import { CircleLoadingAnimation } from '@masknet/shared'

const circle = <CircularProgress color="inherit" size={18} />

interface DebounceButtonProps extends Omit<ButtonProps, 'color' | 'onClick'> {
    color?: ButtonProps['color'] | 'danger'
    onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => unknown
}

function useDebounceAsync<T extends any[]>(
    asyncFn: (...args: T) => unknown,
): { loading: boolean; disabled: boolean; f(...args: T): void } {
    // useAsyncFn use T | [] as it's parameter where is conflict with our usage.
    // We should ensure always call startAsyncFn with parameters.
    const [state, startAsyncFn] = useAsyncFn(asyncFn as any, [asyncFn], { loading: false, value: undefined })
    // Sync the debounce state after 500ms
    const [debounceLoading, setDebounceLoading] = useState(false)
    useDebounce(() => setDebounceLoading(state.loading), 500, [state])
    const f = useCallback(
        (...args: T) => {
            if (state.loading) return
            setDebounceLoading(false)
            startAsyncFn(...args)
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
export function DebounceButton(_props: DebounceButtonProps) {
    const { onClick, color, ...props } = _props
    const classes = useErrorStyles()
    const { f, loading } = useDebounceAsync(onClick)
    return (
        <Button
            startIcon={loading ? circle : undefined}
            disabled={loading}
            onClick={f}
            classes={color === 'danger' ? classes : undefined}
            color={color === 'danger' ? 'primary' : color}
            {...props}
        />
    )
}

export interface ActionButtonProps extends ButtonProps {
    width?: number | string
    loading?: boolean
    component?: keyof JSX.IntrinsicElements | React.ComponentType<any>
}

const useActionButtonStyles = makeStyles()((theme) => ({
    loading: {
        ['& > *']: {
            opacity: 0.3,
        },
    },
}))

export default function ActionButton<T extends React.ComponentType<any> = React.ComponentType<{}>>(
    props: ActionButtonProps & PropsOf<T>,
) {
    const { width, loading, children, className, style, ...rest } = props
    const { classes, cx } = useActionButtonStyles()
    return (
        <Button
            disableElevation
            className={cx('actionButton', className, loading ? classes.loading : undefined)}
            style={{ width, ...style, pointerEvents: loading ? 'none' : undefined }}
            {...rest}
            disabled={rest.disabled && !loading}>
            {loading ? (
                <Box
                    position="absolute"
                    width="100%"
                    height="100%"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    style={{ opacity: 1 }}>
                    <CircleLoadingAnimation />
                </Box>
            ) : null}
            <span>{children}</span>
        </Button>
    )
}

export interface ActionButtonPromiseProps extends ButtonProps {
    executor: () => Promise<ActionButtonPromiseState | undefined | void>
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
                className={failClass}
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
