import { createContext, useContext, useMemo } from 'react'
import type { EnhanceableSite } from '@masknet/shared-base'
import { LogHub } from '@masknet/web3-providers'
import type { LogHubBaseAPI } from '@masknet/web3-providers/types'

interface LoggerContext {
    logger?: LogHubBaseAPI.Logger
}

const LoggerContext = createContext<LoggerContext>(null!)
LoggerContext.displayName = 'LoggerContext'

interface LoggerContextProvider {
    platform: LogHubBaseAPI.Platform | EnhanceableSite
    loggerId: string
}

export function PluginLoggerContextProvider({ children, value }: React.ProviderProps<LoggerContext>) {
    return <LoggerContext.Provider value={{ logger: value.logger }}>{children}</LoggerContext.Provider>
}

export function LoggerContextProvider({ value, children }: React.ProviderProps<LoggerContextProvider>) {
    const logger = useMemo(() => {
        if (!value.loggerId) return
        return LogHub.createLogger(value.platform, value.loggerId)
    }, [value.platform, value.loggerId])

    return <LoggerContext.Provider value={{ logger }}>{children}</LoggerContext.Provider>
}

export function useLoggerContext() {
    return useContext(LoggerContext)
}
