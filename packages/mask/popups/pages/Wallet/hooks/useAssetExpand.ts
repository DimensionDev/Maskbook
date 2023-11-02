import { ValueRef } from '@masknet/shared-base'
import { useCallback } from 'react'
import { useSubscription, type Subscription } from 'use-subscription'

const assetExpandRef = new ValueRef(false)

const subscription: Subscription<boolean> = {
    getCurrentValue() {
        return assetExpandRef.value
    },
    subscribe(callback: () => void) {
        return assetExpandRef.addListener(callback)
    },
}
export function useAssetExpand() {
    const isExpand = useSubscription(subscription)
    const setAssetsIsExpand = useCallback((val: boolean | ((oldVal: boolean) => boolean)) => {
        assetExpandRef.value = typeof val === 'function' ? val(assetExpandRef.value) : val
    }, [])
    return [isExpand, setAssetsIsExpand] as const
}
