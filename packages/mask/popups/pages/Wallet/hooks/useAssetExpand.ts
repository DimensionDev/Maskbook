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
// TODO: this should be a hoist context instead of a global state
export function useAssetExpand() {
    const isExpand = useSubscription(subscription)
    const setAssetsIsExpand = useCallback((val: boolean | ((oldVal: boolean) => boolean)) => {
        // eslint-disable-next-line react-compiler/react-compiler
        assetExpandRef.value = typeof val === 'function' ? val(assetExpandRef.value) : val
    }, [])
    return [isExpand, setAssetsIsExpand] as const
}
