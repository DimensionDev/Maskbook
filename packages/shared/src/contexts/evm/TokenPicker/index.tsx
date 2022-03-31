import { defer, DeferTuple } from '@dimensiondev/kit'
import { EMPTY_LIST } from '@masknet/shared-base'
import type { FungibleTokenDetailed } from '@masknet/web3-shared-evm'
import { createContext, FC, useCallback, useContext, useMemo, useState } from 'react'
import { PickTokenOptions, SelectTokenDialog } from './SelectTokenDialog'

interface ContextOptions {
    pickToken: (options: PickTokenOptions) => Promise<FungibleTokenDetailed | null>
}
const TokenPickerContext = createContext<ContextOptions>(null!)

type PickerDeferTuple = DeferTuple<FungibleTokenDetailed | null>

interface Task {
    id: number
    promise: PickerDeferTuple[0]
    resolve: PickerDeferTuple[1]
    reject: PickerDeferTuple[2]
    pickerOptions: PickTokenOptions
}

let id = 0
export const TokenPickerProvider: FC = ({ children }) => {
    const [tasks, setTasks] = useState<Task[]>(EMPTY_LIST)

    const removeTask = useCallback((task: Task) => {
        setTasks((list) => list.filter((t) => t !== task))
    }, [])

    const contextValue = useMemo(() => {
        return {
            pickToken: (options: PickTokenOptions) => {
                const [promise, resolve, reject] = defer<FungibleTokenDetailed | null>()
                id += 1
                const newTask: Task = { id, promise, resolve, reject, pickerOptions: options }
                setTasks((list) => [...list, newTask])
                return promise
            },
        }
    }, [])

    return (
        <TokenPickerContext.Provider value={contextValue}>
            {children}
            {tasks.map((task) => (
                <SelectTokenDialog
                    open
                    key={task.id}
                    {...task.pickerOptions}
                    onSelect={(token) => {
                        task.resolve(token)
                        removeTask(task)
                    }}
                    onClose={() => {
                        task.resolve(null)
                        removeTask(task)
                    }}
                />
            ))}
        </TokenPickerContext.Provider>
    )
}

export const usePickToken = () => {
    return useContext(TokenPickerContext).pickToken
}
