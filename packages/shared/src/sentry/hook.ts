import type { LogHubBase } from '@masknet/shared-base'
import { useMount } from 'react-use'
import { useLoggerContext } from './context.js'

export const useMountLog = (value: string | object, logger: LogHubBase) => {
    const { logger: contextLogger } = useLoggerContext()

    useMount(() => {
        ;(logger ?? contextLogger)?.captureMessage(value)
    })
}
