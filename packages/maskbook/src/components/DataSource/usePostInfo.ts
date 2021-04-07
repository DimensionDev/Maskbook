import { emptyPostInfo, PostInfo } from '../../social-network/PostInfo'
import { createContext, useContext } from 'react'
import { ValueRef } from '@dimensiondev/holoflows-kit'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { ObservableMap, ObservableSet } from '../../utils/ObservableMapSet'
import { useObservableValues } from '../../utils/hooks/useObservableMapSet'
import { activatedSocialNetworkUI } from '../../social-network'

export const PostInfoContext = createContext(emptyPostInfo)
export function usePostInfo() {
    return useContext(PostInfoContext)
}
type ValidKeys = {
    [key in keyof PostInfo]: PostInfo[key] extends ObservableMap<any, any> | ObservableSet<any> | ValueRef<any>
        ? key
        : never
}[keyof PostInfo]

export function usePostLink() {
    const postID = usePostInfoDetails('postID')
    const postIdentifier = usePostInfoDetails('postIdentifier')
    if (!postID || !postIdentifier) return ''
    return activatedSocialNetworkUI.utils.getPostURL?.(postIdentifier) ?? ''
}

export function usePostInfoDetails<K extends ValidKeys>(
    key: K,
): K extends keyof PostInfo
    ? PostInfo[K] extends ValueRef<infer T>
        ? T
        : PostInfo[K] extends ObservableMap<any, infer T> | ObservableSet<infer T>
        ? T[]
        : never
    : never {
    const post = usePostInfo()
    // @ts-expect-error
    const k = post[key]
    // eslint-disable-next-line react-hooks/rules-of-hooks
    if (k instanceof ValueRef) return useValueRef(k)
    // @ts-expect-error
    // eslint-disable-next-line react-hooks/rules-of-hooks
    if (k instanceof ObservableMap) return useObservableValues(k)
    // @ts-expect-error
    // eslint-disable-next-line react-hooks/rules-of-hooks
    if (k instanceof ObservableSet) return useObservableValues(k)
    throw new Error()
}
