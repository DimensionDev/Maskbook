import { useMount } from 'react-use'
import type { LogHubBase } from '@masknet/web3-providers/types'
import { useLoggerContext } from './context.js'

export const useMountLog = (value: string | object, logger: LogHubBase) => {
    const { logger: contextLogger } = useLoggerContext()

    useMount(() => {
        ;(logger ?? contextLogger)?.captureMessage(value)
    })
}
