import { ValueRef } from '@holoflows/kit/es'
import { useState, useEffect } from 'react'

export function useValueRef<T>(ref: ValueRef<T>) {
    const [value, setValue] = useState<T>(ref.value)
    useEffect(() => {
        if (value !== ref.value) setValue(ref.value)
        return ref.addListener(v => setValue(v))
    }, [ref, value])
    return value
}
