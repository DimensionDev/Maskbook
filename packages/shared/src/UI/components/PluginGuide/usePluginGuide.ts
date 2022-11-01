import type { StorageObject } from '@masknet/shared-base'
import { useSubscription } from 'use-subscription'
import type { PluginGuideSetting } from '.'
import { useCallback, useEffect, useMemo } from 'react'

export const PLUGIN_GUIDE_INIT = 1

export const usePluginGuide = (
    storage: StorageObject<PluginGuideSetting>,
    totalStep: number,
    key?: string,
    onFinish?: () => void,
) => {
    const settings = useSubscription(storage?.userGuide.subscription)

    const currentStep = useMemo(() => {
        return (key ? settings[key] : settings.default) ?? PLUGIN_GUIDE_INIT
    }, [settings, key])

    const nextStep = useCallback(() => {
        if (!storage) return

        storage.userGuide.setValue({ ...settings, [key ?? 'default']: currentStep + 1 })
    }, [storage, settings, currentStep])

    useEffect(() => {
        if (currentStep !== totalStep) return
        onFinish?.()
    }, [onFinish])

    return {
        currentStep,
        nextStep,
        finished: currentStep > totalStep,
    }
}
