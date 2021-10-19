import { useRef, useContext, createContext, useState, useEffect } from 'react'
import type { DialogProps } from '@mui/material'

const StackingScopeEnabled = createContext<boolean>(false)
const Stack = createContext({ level: -1, onHideChange(shouldHide: boolean) {} })
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
    const selfID = useRef(Math.random())
    const featureEnabled = useContext(StackingScopeEnabled)
    const { level: upperLevel, onHideChange } = useContext(Stack)
    // this is an object that stores all request hiding state of it's decedents.
    // e.g for component tree:
    // <Dialog1> (selfID=0)
    // ---- <Dialog2> (selfID=1)
    // ---- <Dialog3> (selfID=2)
    //
    // When dialog2 opened, it will set hide of Dialog1 to { 1: true }
    // If any value in hide is true, it means one of it decedents requested to hide this parent.
    const [hide, setHide] = useState<Record<number, boolean>>({})

    const LatestOnHideChange = useRef<(hide: boolean) => void>(onHideChange)
    LatestOnHideChange.current = onHideChange

    // Here we rely on the assumption that level is impossible to change.
    // because it requires a reorder in the component tree, which is not possible to happen
    // in React's reconciliation algorithm
    const Increase = useRef<React.ComponentType<React.PropsWithChildren<{}>>>(null!)
    if (!Increase.current) {
        Increase.current = function IncreaseStackLevel(props: React.PropsWithChildren<{}>) {
            return (
                <Stack.Provider
                    children={props.children}
                    value={{
                        level: upperLevel + 1,
                        onHideChange: (hide) => {
                            setHide((val) => ({ ...val, [selfID.current]: hide }))
                        },
                    }}
                />
            )
        }
    }

    useEffect(() => {
        if (!featureEnabled) return LatestOnHideChange.current(false)
        LatestOnHideChange.current(open)
    }, [featureEnabled, open])

    useEffect(() => {
        return () => LatestOnHideChange.current(false)
    }, [])

    const returnVal: useDialogStackActorReturn = {
        shouldReplaceExitWithBack: upperLevel !== -1,
        extraProps: { open },
        IncreaseStack: Increase.current,
    }

    if (!featureEnabled || !open) return returnVal

    if (returnVal.shouldReplaceExitWithBack) {
        returnVal.extraProps.transitionDuration = 0
    }

    if (Object.values(hide).some(Boolean)) {
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
    IncreaseStack: React.ComponentType<React.PropsWithChildren<{}>>
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
    return <StackingScopeEnabled.Provider children={props.children} value={!props.disabled} />
}
