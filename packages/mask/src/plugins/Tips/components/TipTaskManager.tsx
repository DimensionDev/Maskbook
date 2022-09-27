import { PluginIDContextProvider, PluginWeb3ContextProvider, useWeb3State } from '@masknet/plugin-infra/web3'
import { EMPTY_LIST } from '@masknet/shared-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { FC, useCallback, useEffect, useState } from 'react'
import { TargetRuntimeContext, TipTaskProvider } from '../contexts/index.js'
import { PluginTipsMessages } from '../messages.js'
import type { TipTask } from '../types/index.js'
import { TipDialog } from './TipDialog.js'

let id = 0

interface Task extends TipTask {
    id: number
}
export const TipTaskManager: FC<React.PropsWithChildren<{}>> = ({ children }) => {
    const [tasks, setTasks] = useState<Task[]>(EMPTY_LIST)
    const { targetChainId, pluginId } = TargetRuntimeContext.useContainer()
    const { Others } = useWeb3State(pluginId)

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
                const included = list.some((t) => t.recipientSnsId === task.recipientSnsId)
                if (!included) return list
                return list.map((t) => (t.recipientSnsId === task.recipientSnsId ? { ...task, id: t.id } : t))
            })
        })
    }, [])

    // We assume there is only single one tips task at each time.
    return (
        <PluginWeb3ContextProvider pluginID={pluginId} value={{ chainId: targetChainId }}>
            {tasks.map((task) => {
                const tipsAccount = task.addresses.find((x) => isSameAddress(x.address, task.recipient))
                const taskSession = (
                    <TipTaskProvider key={task.id} task={task}>
                        <TipDialog open key={task.id} onClose={() => removeTask(task)} />
                    </TipTaskProvider>
                )

                return tipsAccount?.pluginId ? (
                    <PluginIDContextProvider key={task.id} value={tipsAccount?.pluginId}>
                        {taskSession}
                    </PluginIDContextProvider>
                ) : (
                    taskSession
                )
            })}
            {children}
        </PluginWeb3ContextProvider>
    )
}
