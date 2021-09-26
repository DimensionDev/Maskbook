/* eslint-disable no-bitwise */
/* eslint-disable @typescript-eslint/prefer-literal-enum-member */
import { createContainer } from 'unstated-next'
import { useRef, useEffect, useState } from 'react'
import { first, last } from 'lodash-es'
import type { DialogProps } from '@mui/material'

/**
 * If you're using <Dialog> solely and you want to support DialogStack, please use this hook.
 *
 * Your dialog component MUST support `style` attribute and `disable`
 * @example
 * function SomeComponent() {
 *     const [open, setOpen] = useState(false)
 *     const {shouldReplaceExitWithBack, extraProps} = useDialogStackConsumer(open)
 *     return <>
 *         <button onClick={() => setOpen(true)}></button>
 *         <Dialog open={open} {...extraProps}>
 *             You MUST hide Close button and and BackButton based on the value of `shouldReplaceExitWithBack`
 *         </Dialog>
 *     </>
 * }
 */
export function useDialogStackConsumer(open: boolean): { shouldReplaceExitWithBack: boolean; extraProps: DialogProps } {
    const [status, setStatus] = useState(Type.None)
    const { enabled, openDialog, closeDialog } = useDialogStackingContext()
    const { current: id } = useRef(Math.random())

    useEffect(() => {
        open ? openDialog(id, setStatus) : closeDialog(id)
    }, [open])

    useEffect(() => () => closeDialog(id), [])

    const shouldReplaceExitWithBack = !!(status & Type.shouldReplaceExitWithBack)
    const isTop = !!(status & Type.TopMostDialog)

    if (!enabled || !open) return { shouldReplaceExitWithBack: false, extraProps: { open } }
    if (isTop)
        return {
            shouldReplaceExitWithBack,
            extraProps: { open, transitionDuration: shouldReplaceExitWithBack ? 0 : undefined },
        }
    return {
        shouldReplaceExitWithBack,
        extraProps: {
            disableEscapeKeyDown: true,
            disableScrollLock: true,
            hideBackdrop: true,
            style: { visibility: 'hidden' },
            'aria-hidden': true,
            open,
            transitionDuration: shouldReplaceExitWithBack ? 0 : undefined,
        },
    }
}

export interface DialogStackingProviderProps extends React.PropsWithChildren<{}> {
    disabled?: boolean
}

/**
 * This Provider can turn any `MaskDialog` or `InjectedDialog` in the subtree into a unified dialog.
 *
 * For example:
 *
 * ```tsx
 * <DialogStackingProvider>
 *    <Dialog1>
 *        <Dialog2></Dialog2>
 *    </Dialog1>
 * </DialogStackingProvider>
 * ```
 *
 * When Dialog1 and Dialog2 both opened, only Dialog2 will be visible and the left top button
 * becomes "BackArrow".
 */
export function DialogStackingProvider(props: DialogStackingProviderProps) {
    return <Provider initialState={!props.disabled}>{props.children}</Provider>
}

function useDialogStackingContext(): ReturnType<typeof useStack> {
    try {
        return useContainer()
    } catch {
        return {
            enabled: false,
            closeDialog: () => [],
            openDialog: () => [],
        }
    }
}

enum Type {
    None = 0,
    TopMostDialog = 1 << 0,
    shouldReplaceExitWithBack = 1 << 1,
}

function useStack(enabled = true) {
    type F = (status: Type) => void
    const functions = useRef<Map<number, F>>(new Map())
    const stack = useRef<readonly number[]>([])

    function update() {
        for (const [id, update] of functions.current) {
            let result: Type = Type.None
            if (stack.current.length > 1 && first(stack.current) !== id) result |= Type.shouldReplaceExitWithBack
            if (last(stack.current) === id) result |= Type.TopMostDialog
            update(result)
        }
    }
    return {
        enabled,
        openDialog: (id: number, onUpdate: F) => {
            ;(functions.current = new Map(functions.current)).set(id, onUpdate)
            stack.current = [...stack.current, id]
            update()
        },
        closeDialog: (id: number) => {
            ;(functions.current = new Map(functions.current)).delete(id)
            stack.current = stack.current.filter((x) => x !== id)
            update()
        },
    }
}
const { Provider, useContainer } = createContainer(useStack)
