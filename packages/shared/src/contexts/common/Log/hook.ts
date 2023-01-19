import { useMount } from 'react-use'
import type { LogHubBaseAPI } from '@masknet/web3-providers/types'
import { useLoggerContext } from './context.js'

export const useMountLog = (value: string | object, logger: LogHubBaseAPI.Logger) => {
    const { logger: contextLogger } = useLoggerContext()

    useMount(() => {
        ;(logger ?? contextLogger)?.captureMessage(value)
    })
}
