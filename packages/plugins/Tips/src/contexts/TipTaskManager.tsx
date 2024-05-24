import { useCallback, useEffect, useState, type PropsWithChildren } from 'react'
import { isEqual } from 'lodash-es'
import { EMPTY_LIST } from '@masknet/shared-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { TipDialog } from '../components/index.js'
import { PluginTipsMessages } from '../messages.js'
import type { TipTask } from '../types/index.js'
import { TipTaskProvider } from './Tip/TipTaskProvider.js'
import { TargetRuntimeContext, ChainRuntime } from './TargetRuntimeContext.js'

let id = 0

interface Task extends TipTask {
    id: number
}

export function TipTaskManager({ children }: PropsWithChildren) {
    const [tasks, setTasks] = useState<Task[]>(EMPTY_LIST)

    const removeTask = useCallback((task: Task) => {
        setTasks((list) => list.filter((t) => t.id !== task.id))
    }, [])

    useEffect(() => {
        return PluginTipsMessages.tipTask.on((task) => {
            id += 1
            setTasks((list) => [...list, { id, ...task }])
        })
    }, [])

    useEffect(() => {
        return PluginTipsMessages.tipTaskUpdate.on((task) => {
            setTasks((list) => {
                const included = list.some((t) => t.recipientUserId === task.recipientUserId)
                if (!included) return list
                if (list.some((t) => isEqual(task, t))) return list
                return list.map((t) => (t.recipientUserId === task.recipientUserId ? { ...task, id: t.id } : t))
            })
        })
    }, [])

    // We assume there is only single one tips task at each time.
    return (
        <>
            {tasks.map((task) => {
                const tipsAccount = task.accounts.find((x) => isSameAddress(x.address, task.recipient))
                const pluginID = tipsAccount?.pluginID ?? task.accounts[0].pluginID
                return (
                    <TargetRuntimeContext key={task.id} initialState={pluginID}>
                        <ChainRuntime>
                            <TipTaskProvider task={task}>
                                <TipDialog open onClose={() => removeTask(task)} />
                            </TipTaskProvider>
                        </ChainRuntime>
                    </TargetRuntimeContext>
                )
            })}
            {children}
        </>
    )
}
