import { useRef, useContext, createContext, useState, useMemo, useLayoutEffect } from 'react'
import { type DialogProps } from '@mui/material'
import { noop } from 'lodash-es'

interface StackContext {
    stack: readonly string[]
    push(id: string): void
    pop(id: string): void
    setParent(selfID: string, parentID: string | null): () => void
    hasGlobalBackdrop: boolean
}
const DialogStackingContext = createContext<StackContext>({
    stack: [],
    push: noop,
    pop: noop,
    setParent: () => noop,
    hasGlobalBackdrop: false,
})
DialogStackingContext.displayName = 'DialogStackingContext'

const DialogHierarchyContext = createContext<string | null>(null)
DialogHierarchyContext.displayName = 'DialogHierarchyContext'

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
 *     const { shouldReplaceExitWithBack, extraProps, TrackDialogHierarchy } = useDialogStackConsumer(open)
 *     return <TrackDialogHierarchy>
 *         <button onClick={() => setOpen(true)}></button>
 *         <Dialog open={open} {...extraProps}>
 *             You MUST hide Close button and BackButton based on the value of `shouldReplaceExitWithBack`
 *         </Dialog>
 *     </TrackDialogHierarchy>
 * }
 */
export function useDialogStackActor(open: boolean): useDialogStackActorReturn {
    const selfID = useRef('' + Math.random()).current
    const { pop, push, stack, setParent, hasGlobalBackdrop } = useContext(DialogStackingContext)

    // children's useEffect will run before parent's useEffect.
    // when the hierarchy is A > B and they are both open,
    // the stack will be ["B", "A"] (B pushed into the stack first.)
    // we need to notify the context the react component tree hierarchy to order them correctly.
    const parentID = useContext(DialogHierarchyContext)
    useLayoutEffect(() => setParent(selfID, parentID), [parentID])

    useLayoutEffect(() => {
        open ? push(selfID) : pop(selfID)
        return () => pop(selfID)
    }, [open])

    const TrackDialogHierarchy = (useRef<useDialogStackActorReturn['TrackDialogHierarchy']>(null!).current ??=
        function TrackDialogHierarchy({ children }) {
            return <DialogHierarchyContext value={selfID}>{children}</DialogHierarchyContext>
        })

    const returnVal: useDialogStackActorReturn = {
        shouldReplaceExitWithBack: stack.length > 1,
        extraProps: { open },
        TrackDialogHierarchy,
    }
    if (hasGlobalBackdrop) returnVal.extraProps.hideBackdrop = true
    if (stack.length > 1) returnVal.extraProps.transitionDuration = 0

    if (!open) return returnVal
    if (stack.at(-1) !== selfID) {
        returnVal.extraProps = {
            ...returnVal.extraProps,
            disableEscapeKeyDown: true,
            disableScrollLock: true,
            hideBackdrop: true,
            hidden: true,
            style: { visibility: 'hidden' },
            'aria-hidden': true,
        }
    }
    return returnVal
}

export interface useDialogStackActorReturn {
    shouldReplaceExitWithBack: boolean
    extraProps: DialogProps
    TrackDialogHierarchy: React.ComponentType<React.PropsWithChildren>
}

export interface DialogStackingProviderProps extends React.PropsWithChildren {
    hasGlobalBackdrop?: boolean
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
    const [hierarchy, setHierarchy] = useState<Hierarchy>({})
    const context = useMemo((): StackContext => {
        const sortedStack = sortStackByHierarchy(hierarchy, stack)
        return {
            hasGlobalBackdrop: props.hasGlobalBackdrop || false,
            stack: sortedStack,
            // Note: the following methods MUST NOT use stack or hierarchy out of the useState callback.
            setParent(child, parent) {
                if (!parent) return noop
                setHierarchy((hierarchy) => {
                    if (hierarchy[parent]?.has(child)) return hierarchy
                    const newSet = new Set(hierarchy[parent] || [])
                    newSet.add(child)
                    return { ...hierarchy, [parent]: newSet }
                })

                return () => {
                    setHierarchy((hierarchy) => {
                        const newSet = new Set(hierarchy[parent])
                        newSet.delete(child)
                        return { ...hierarchy, [parent]: newSet }
                    })
                }
            },
            pop(id: string) {
                setStack((stack) => (stack.includes(id) ? stack.filter((x) => x !== id) : stack))
            },
            push(id: string) {
                setStack((stack) => (stack.includes(id) ? stack : stack.concat(id)))
            },
        }
    }, [stack, hierarchy, props.hasGlobalBackdrop])
    return <DialogStackingContext value={context}>{props.children}</DialogStackingContext>
}

export function useDialogStacking() {
    return useContext(DialogStackingContext)
}

type Hierarchy = {
    readonly [parent: string]: undefined | ReadonlySet<string>
}
function sortStackByHierarchy(hierarchy: Hierarchy, stack: readonly string[]): readonly string[] {
    if (stack.length <= 1) return stack
    const last = stack.at(-1)!
    const children = hierarchy[last]
    if (!children?.size) return stack
    for (const child of children) {
        if (stack.includes(child)) return sortStackByHierarchy(hierarchy, [last].concat(stack.slice(0, -1)))
    }
    return stack
}
