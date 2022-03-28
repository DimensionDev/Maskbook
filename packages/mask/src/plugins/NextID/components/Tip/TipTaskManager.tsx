import { FC, useCallback, useEffect, useState } from 'react'
import { EMPTY_LIST } from '@masknet/shared-base'
import { TipTaskProvider } from '../../contexts'
import { PluginNextIdMessages } from '../../messages'
import type { TipTask } from '../../types'
import { TipDialog } from './TipDialog'

let id = 0

interface Task extends TipTask {
    id: number
}
export const TipTaskManager: FC = ({ children }) => {
    const [tasks, setTasks] = useState<Task[]>(EMPTY_LIST)

    const removeTask = useCallback((task: Task) => {
        setTasks((list) => list.filter((t) => t !== task))
    }, [])

    useEffect(() => {
        return PluginNextIdMessages.tipTask.on((task) => {
            id += 1
            setTasks((list) => [...list, { id, ...task }])
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
