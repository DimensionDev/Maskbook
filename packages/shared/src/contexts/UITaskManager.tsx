import {
    createContext,
    createElement,
    FC,
    ComponentType,
    PropsWithChildren,
    useMemo,
    useState,
    SyntheticEvent,
} from 'react'
import { defer, DeferTuple } from '@dimensiondev/kit'
import { EMPTY_LIST } from '@masknet/shared-base'
import { useUpdate } from 'react-use'

export interface ContextOptions<T, R> {
    show(options?: Omit<T, 'open'>, signal?: AbortSignal): Promise<R>
}

export interface BaseModalPopperProps<T> {
    open: boolean
    anchorEl?: HTMLElement | SyntheticEvent<HTMLElement>
    anchorSibling?: boolean
    onClose?(event: {}, reason: 'backdropClick' | 'escapeKeyDown'): void
    onSubmit?(result: T | null): void
}

/**
 * Create a manager of small UI task sessions,
 * which provides both a Context and a Provider.
 */
export const createUITaskManager = <TaskOptions extends BaseModalPopperProps<Result>, Result>(
    Component: ComponentType<TaskOptions>,
) => {
    const TaskManagerContext = createContext<ContextOptions<TaskOptions, Result | null>>(null!)
    let id = 0

    type TaskDeferTuple = DeferTuple<Result | null>
    interface Task {
        id: number
        promise: Promise<Result | null>
        resolve: TaskDeferTuple[1]
        reject: TaskDeferTuple[2]
        options?: Omit<TaskOptions, 'open'>
    }

    const TaskManagerProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
        const [tasks, setTasks] = useState<Task[]>(EMPTY_LIST)
        const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

        const update = useUpdate()

        const contextValue = useMemo(() => {
            const removeTask = (id: number) => {
                setTasks((list) => list.filter((t) => t.id !== id))
            }

            return {
                show(options?: Omit<TaskOptions, 'open'>, signal?: AbortSignal) {
                    const [promise, resolve, reject] = defer<Result | null>()
                    id += 1
                    signal?.addEventListener('abort', function abortHandler() {
                        resolve(null)
                        signal.removeEventListener('abort', abortHandler)
                    })

                    // #region Mui Popper
                    if (options?.anchorEl) {
                        let element: HTMLElement
                        if (options?.anchorEl instanceof HTMLElement) {
                            element = options?.anchorEl
                        } else {
                            element = options?.anchorEl.currentTarget
                        }

                        // when the essential content of currentTarget would be closed over,
                        //  we can set the anchorEl with currentTarget's bottom sibling to avoid it.
                        const finalAnchor = options?.anchorSibling
                            ? (element.nextElementSibling as HTMLElement) ?? undefined
                            : element
                        setAnchorEl(finalAnchor)
                        // HACK: it seems like anchor doesn't work correctly
                        // but a force repaint can solve the problem.
                        window.requestAnimationFrame(update)
                    }
                    // # endregion
                    const newTask: Task = { id, promise, resolve, reject, options }
                    setTasks((list) => [...list, newTask])
                    promise.then(() => {
                        removeTask(id)
                    })
                    return promise
                },
            }
        }, [])

        return (
            <TaskManagerContext.Provider value={contextValue}>
                {children}
                {tasks.map((task) => {
                    return createElement(
                        Component,
                        {
                            ...task.options,
                            anchorEl,
                            key: task.id,
                            open: true,
                            onSubmit: (result: Result | null) => {
                                task.options?.onSubmit?.(result)
                                task.resolve(result)
                            },
                            onClose: () => {
                                task.resolve(null)
                                setAnchorEl(null)
                            },
                            onClick: () => {
                                task.resolve(null)
                                setAnchorEl(null)
                            },
                        } as unknown as TaskOptions,
                        children,
                    )
                })}
            </TaskManagerContext.Provider>
        )
    }
    return { TaskManagerContext, TaskManagerProvider }
}
