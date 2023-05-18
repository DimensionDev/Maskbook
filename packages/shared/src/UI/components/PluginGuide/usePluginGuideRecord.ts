import type { PluginID } from '@masknet/shared-base'
import { useCallback } from 'react'
import { useLocalStorage } from 'react-use'

export const PLUGIN_GUIDE_INIT = 1

export function usePluginGuideRecord(pluginID: PluginID, totalStep: number, key?: string, onFinish?: () => void) {
    const [setting = PLUGIN_GUIDE_INIT, setSetting] = useLocalStorage<number>(
        `plugin_userGuide_${pluginID}_${key ?? 'default'}`,
        PLUGIN_GUIDE_INIT,
    )

    const nextStep = useCallback(() => {
        const nextStepValue = setting + 1
        setSetting(nextStepValue)

        if (nextStepValue > totalStep) onFinish?.()
    }, [setSetting, setting, totalStep])

    return {
        currentStep: setting,
        nextStep,
        finished: setting > totalStep,
    }
}
