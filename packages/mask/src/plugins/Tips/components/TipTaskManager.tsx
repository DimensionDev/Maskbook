import { FC, useCallback, useEffect, useState } from 'react'
import { EMPTY_LIST } from '@masknet/shared-base'
import { TipTaskProvider } from '../contexts'
import { PluginNextIDMessages } from '../messages'
import type { TipTask } from '../types'
import { TipDialog } from './TipDialog'

let id = 0

interface Task extends TipTask {
    id: number
}
export const TipTaskManager: FC<React.PropsWithChildren<{}>> = ({ children }) => {
    const [tasks, setTasks] = useState<Task[]>(EMPTY_LIST)

    const removeTask = useCallback((task: Task) => {
        setTasks((list) => list.filter((t) => t.id !== task.id))
    }, [])

    useEffect(() => {
        return PluginNextIDMessages.tipTask.on((task) => {
            id += 1
            setTasks((list) => [...list, { id, ...task }])
        })
    }, [])

    useEffect(() => {
        return PluginNextIDMessages.tipTaskUpdate.on((task) => {
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
                <TipTaskProvider key={task.id} task={task}>
                    <TipDialog open key={task.id} onClose={() => removeTask(task)} />
                </TipTaskProvider>
            ))}
            {children}
        </>
    )
}
