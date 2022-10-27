import { useRef, useContext, createContext, useState, useMemo } from 'react'
import type { DialogProps } from '@mui/material'

const StackingScopeEnabled = createContext<boolean>(false)
StackingScopeEnabled.displayName = 'DialogStackingScopeEnabledContext'

const DialogStackingContext = createContext({
    stack: [] as readonly string[],
    push(id: string) {},
    pop(id: string) {},
})
DialogStackingContext.displayName = 'DialogStackingContext'

// This function works in the following manner
// Within a DialogStackingContext
/**
 * If you're using <Dialog> on its own and you want to support DialogStack, please use this hook.
 *
 * Your dialog component MUST support the following attributes with the same semantics with MUI Dialog component.
 *
 * - disableEscapeKeyDown
 * - disableScrollLock
 * - hideBackdrop
 * - style
 * - aria-hidden
 * - open
 * - transitionDuration
 * @example
 * function SomeComponent() {
 *     const [open, setOpen] = useState(false)
 *     const { shouldReplaceExitWithBack, extraProps } = useDialogStackConsumer(open)
 *     return <IncreaseStack>
 *         <button onClick={() => setOpen(true)}></button>
 *         <Dialog open={open} {...extraProps}>
 *             You MUST hide Close button and and BackButton based on the value of `shouldReplaceExitWithBack`
 *         </Dialog>
 *     </IncreaseStack>
 * }
 */
export function useDialogStackActor(open: boolean): useDialogStackActorReturn {
    const { current: selfID } = useRef('' + Math.random())
    const { pop, push, stack } = useContext(DialogStackingContext)
    const featureEnabled = useContext(StackingScopeEnabled)

    const returnVal: useDialogStackActorReturn = {
        shouldReplaceExitWithBack: stack.length > 1,
        extraProps: { open },
    }

    if (!featureEnabled || !open) return returnVal

    if (returnVal.shouldReplaceExitWithBack) returnVal.extraProps.transitionDuration = 0

    if (stack.at(-1) !== selfID) {
        returnVal.extraProps = {
            ...returnVal.extraProps,
            disableEscapeKeyDown: true,
            disableScrollLock: true,
            hideBackdrop: true,
            style: { visibility: 'hidden' },
            'aria-hidden': true,
        }
    }
    return returnVal
}

export interface useDialogStackActorReturn {
    shouldReplaceExitWithBack: boolean
    extraProps: DialogProps
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
 *    <Dialog3></Dialog3>
 * </DialogStackingProvider>
 * ```
 *
 * When Dialog1 and Dialog2 both opened, only Dialog2 will be visible and the left top button
 * becomes "BackArrow".
 */
export function DialogStackingProvider(props: DialogStackingProviderProps) {
    const [stack, setStack] = useState<readonly string[]>([])
    const context = useMemo(
        () => ({
            stack,
            pop(id: string) {
                setStack(stack.filter((x) => x !== id))
            },
            push(id: string) {
                setStack([...stack, id])
            },
        }),
        [stack],
    )
    return (
        <StackingScopeEnabled.Provider value={!props.disabled}>
            <DialogStackingContext.Provider value={context}>{props.children}</DialogStackingContext.Provider>
        </StackingScopeEnabled.Provider>
    )
}
