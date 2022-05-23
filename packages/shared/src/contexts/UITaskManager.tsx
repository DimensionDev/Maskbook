import { defer, DeferTuple } from '@dimensiondev/kit'
import { EMPTY_LIST } from '@masknet/shared-base'
import { createContext, createElement, FC, ComponentType, PropsWithChildren, useMemo, useState } from 'react'
import type { InjectedDialogProps } from './components'

interface ContextOptionsGeneric<T, R> {
    show(options: T, signal?: AbortSignal): Promise<R>
}

interface BaseDialogProps<T> extends Pick<InjectedDialogProps, 'open' | 'onClose'> {
    onSubmit?(result: T): void
}

/**
 * Create a manager of small UI task sessions,
 * which provide both a Context and a Provider.
 */
export const createUITaskManager = <
    TaskOptions extends { onSubmit?(result: Result | null): void },
    Result,
    Props extends BaseDialogProps<Result>,
>(
    Component: ComponentType<Props>,
) => {
    type ContextOptions = ContextOptionsGeneric<TaskOptions, Result | null>
    const TaskManagerContext = createContext<ContextOptions>(null!)
    let id = 0

    type TaskDeferTuple = DeferTuple<Result | null>
    interface Task {
        id: number
        promise: Promise<Result | null>
        resolve: TaskDeferTuple[1]
        reject: TaskDeferTuple[2]
        options: TaskOptions
    }

    const TaskManagerProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
        const [tasks, setTasks] = useState<Task[]>(EMPTY_LIST)

        const contextValue = useMemo(() => {
            const removeTask = (id: number) => {
                setTasks((list) => list.filter((t) => t.id !== id))
            }

            return {
                show(options: TaskOptions, signal?: AbortSignal) {
                    const [promise, resolve, reject] = defer<Result | null>()
                    id += 1
                    signal?.addEventListener('abort', function abortHandler() {
                        resolve(null)
                        signal.removeEventListener('abort', abortHandler)
                    })
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
                            key: task.id,
                            open: true,
                            ...task.options,
                            onSubmit: (result: Result | null) => {
                                task.options.onSubmit?.(result)
                                task.resolve(result)
                            },
                            onClose: () => {
                                task.resolve(null)
                            },
                        } as unknown as Props,
                        children,
                    )
                })}
            </TaskManagerContext.Provider>
        )
    }
    return { TaskManagerContext, TaskManagerProvider }
}
