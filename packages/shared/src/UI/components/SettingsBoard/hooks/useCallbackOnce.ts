import { DependencyList, useCallback, useRef } from 'react'

export function useCallbackOnce<T extends Function>(callback: T, deps: DependencyList) {
    const flag = useRef<boolean>(false)
    const callback_ = (...args: any[]) => {
        if (flag.current) return
        flag.current = true
        callback(...args)
    }

    return useCallback(callback_ as unknown as T, deps.concat(flag))
}
