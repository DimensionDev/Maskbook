import type { StorageObject } from '@masknet/shared-base'
import { useSubscription } from 'use-subscription'
import { useCallback, useEffect, useMemo } from 'react'
import type { PluginGuideSetting } from './type'

export const PLUGIN_GUIDE_INIT = 1

export const usePluginGuideRecord = (
    storage: StorageObject<PluginGuideSetting>,
    totalStep: number,
    key?: string,
    onFinish?: () => void,
) => {
    const record = useSubscription(storage?.userGuide.subscription)

    const currentStep = useMemo(() => {
        return (key ? record[key] : record.default) ?? PLUGIN_GUIDE_INIT
    }, [record, key])

    const nextStep = useCallback(() => {
        if (!storage) return

        storage.userGuide.setValue({ ...record, [key ?? 'default']: currentStep + 1 })
    }, [storage, record, currentStep])

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
