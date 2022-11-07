import { FC, useCallback, useEffect, useState } from 'react'
import { isEqual } from 'lodash-es'
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import { Web3ContextProvider } from '@masknet/web3-hooks-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { isSameAddress } from '@masknet/web3-shared-base'
import { TipDialog } from '../components/index.js'
import { PluginTipsMessages } from '../messages.js'
import type { TipTask } from '../types/index.js'
import { TipTaskProvider } from './Tip/TipTaskProvider.js'
import { TipsTransactionProvider } from './TipsTransaction.js'

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
                if (list.some((t) => isEqual(task, t))) return list
                return list.map((t) => (t.recipientSnsId === task.recipientSnsId ? { ...task, id: t.id } : t))
            })
        })
    }, [])

    // We assume there is only single one tips task at each time.
    return (
        <>
            {tasks.map((task) => {
                const tipsAccount = task.accounts.find((x) => isSameAddress(x.address, task.recipient))

                return (
                    <Web3ContextProvider
                        key={task.id}
                        value={{
                            pluginID: tipsAccount?.pluginID ?? NetworkPluginID.PLUGIN_EVM,
                            chainId: ChainId.Mainnet,
                        }}>
                        <TipTaskProvider key={task.id} task={task}>
                            <TipsTransactionProvider>
                                <TipDialog open key={task.id} onClose={() => removeTask(task)} />
                            </TipsTransactionProvider>
                        </TipTaskProvider>
                    </Web3ContextProvider>
                )
            })}
            {children}
        </>
    )
}
