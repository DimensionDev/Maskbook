import { FC, useCallback, useEffect, useState } from 'react'
import { EMPTY_LIST } from '@masknet/shared-base'
import { PluginContext, TipsContextProvider } from '../../Context/index.js'
import { PluginTipsMessages } from '../../../messages.js'
import type { Task } from '../../../types/index.js'
import { TipsDialog } from '../TipsDialog/index.js'

let id = 0

export interface TaskIndexed extends Task {
    id: number
}

export const TipsTaskManager: FC<React.PropsWithChildren<{}>> = ({ children }) => {
    const [tasks, setTasks] = useState<TaskIndexed[]>(EMPTY_LIST)

    const removeTask = useCallback((task: TaskIndexed) => {
        setTasks((list) => list.filter((t) => t.id !== task.id))
    }, [])

    useEffect(() => {
        return PluginTipsMessages.tipsTask.on((task) => {
            id += 1
            setTasks((list) => [...list, { id, ...task }])
        })
    }, [])

    useEffect(() => {
        return PluginTipsMessages.tipsTaskUpdate.on((task) => {
            setTasks((list) => {
                const included = list.some((t) => t.recipientSnsId === task.recipientSnsId)
                if (!included) return list
                return list.map((t) => (t.recipientSnsId === task.recipientSnsId ? { ...task, id: t.id } : t))
            })
        })
    }, [])

    return (
        <>
            {tasks.map((task) => (
                <PluginContext.Provider>
                    <TipsContextProvider key={task.id} task={task}>
                        <TipsDialog open key={task.id} onClose={() => removeTask(task)} />
                    </TipsContextProvider>
                </PluginContext.Provider>
            ))}
            {children}
        </>
    )
}
