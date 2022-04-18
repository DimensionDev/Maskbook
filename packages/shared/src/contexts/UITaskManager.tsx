import { defer, DeferTuple } from '@dimensiondev/kit'
import { EMPTY_LIST } from '@masknet/shared-base'
import { createContext, createElement, FC, FunctionComponent, PropsWithChildren, useMemo, useState } from 'react'
import type { InjectedDialogProps } from './components'

interface ContextOptionsGeneric<T, R> {
    show(options: T): Promise<R>
}

type BaseDialogProps = Pick<InjectedDialogProps, 'open' | 'onClose'>

export const createUITaskManager = <
    TaskOptions,
    Result,
    Props extends BaseDialogProps,
    ResolveProp extends keyof Props,
>(
    Component: FunctionComponent<Props>,
    taskResolveFieldKey: ResolveProp,
) => {
    type ContextOptions = ContextOptionsGeneric<TaskOptions, Result | null>
    const TaskManagerContext = createContext<ContextOptions>(null!)
    let id = 0

    type TaskDeferTuple = DeferTuple<Result | null>
    interface TaskBase {
        id: number
        promise: TaskDeferTuple[0]
        resolve: TaskDeferTuple[1]
        reject: TaskDeferTuple[2]
    }
    interface Task extends TaskBase {
        taskOptions: TaskOptions
    }

    const TaskManagerProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
        const [tasks, setTasks] = useState<Task[]>(EMPTY_LIST)

        const contextValue = useMemo(() => {
            const removeTask = (task: Task) => {
                setTasks((list) => list.filter((t) => t !== task))
            }

            return {
                show: (options: TaskOptions) => {
                    const [promise, resolve, reject] = defer<Result | null>()
                    id += 1
                    const newTask: Task = { id, promise, resolve, reject, taskOptions: options }
                    setTasks((list) => [...list, newTask])
                    promise.then(() => {
                        removeTask(newTask)
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
                            ...task.taskOptions,
                            [taskResolveFieldKey]: (result: Result | null) => {
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
