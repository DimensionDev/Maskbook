import { defer, DeferTuple } from '@dimensiondev/kit'
import { EMPTY_LIST } from '@masknet/shared-base'
import { createContext, createElement, FC, FunctionComponent, PropsWithChildren, useMemo, useState } from 'react'
import type { InjectedDialogProps } from './components'

type ExtendPromise<T> = Promise<T> & {
    close(): Promise<T>
}
interface ContextOptionsGeneric<T, R> {
    show(options: T): ExtendPromise<R>
}

type BaseDialogProps = Pick<InjectedDialogProps, 'open' | 'onClose'>

/**
 * Create a manager of small UI task sessions,
 * which provide  a Context and a Provider
 */
export const createUITaskManager = <
    TaskOptions,
    Result,
    Props extends BaseDialogProps,
    ResolveProp extends keyof Props,
>(
    Component: FunctionComponent<Props>,
    taskResolveField: ResolveProp,
) => {
    type ContextOptions = ContextOptionsGeneric<TaskOptions, Result | null>
    const TaskManagerContext = createContext<ContextOptions>(null!)
    let id = 0

    type TaskDeferTuple = DeferTuple<Result | null>
    interface TaskBase {
        id: number
        promise: Promise<Result | null>
        resolve: TaskDeferTuple[1]
        reject: TaskDeferTuple[2]
    }
    interface Task extends TaskBase {
        taskOptions: TaskOptions
    }

    const TaskManagerProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
        const [tasks, setTasks] = useState<Task[]>(EMPTY_LIST)

        const contextValue = useMemo(() => {
            const removeTask = (id: number) => {
                setTasks((list) => list.filter((t) => t.id !== id))
            }

            return {
                show(options: TaskOptions) {
                    const [promise, resolve, reject] = defer<Result | null>()
                    id += 1
                    const extendedPromise = Object.assign(promise, {
                        close() {
                            resolve(null)
                            return promise
                        },
                    })
                    const newTask: Task = { id, promise, resolve, reject, taskOptions: options }
                    setTasks((list) => [...list, newTask])
                    promise.then(() => {
                        removeTask(id)
                    })
                    return extendedPromise
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
                            ...task.taskOptions,
                            [taskResolveField]: (result: Result | null) => {
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
