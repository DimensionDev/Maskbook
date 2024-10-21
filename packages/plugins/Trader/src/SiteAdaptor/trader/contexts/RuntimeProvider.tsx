import type { Web3Helper } from '@masknet/web3-helpers'
import { createContext, useContext, type PropsWithChildren } from 'react'

export interface ShowTooltipOptions {
    title: string
    message: string
}

export interface RuntimeOptions {
    basepath: string
    pickToken(
        currentToken: Web3Helper.FungibleTokenAll | null | undefined,
        side: 'from' | 'to',
        excludes: string[],
    ): Promise<Web3Helper.FungibleTokenAll | null>
    showToolTip(options: ShowTooltipOptions): void
}

const RuntimeContext = createContext<RuntimeOptions>(null!)

export function RuntimeProvider({ children, runtime }: PropsWithChildren<{ runtime: RuntimeOptions }>) {
    return <RuntimeContext.Provider value={runtime}>{children}</RuntimeContext.Provider>
}

export function useRuntime() {
    return useContext(RuntimeContext)
}
