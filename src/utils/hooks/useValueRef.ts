import { ValueRef } from '@holoflows/kit/es'
import { useState, useEffect } from 'react'

export function useValueRef<T>(ref: ValueRef<T>) {
    const [value, setValue] = useState<T>(ref.value)
    useEffect(() => ref.addListener(newValue => setValue(newValue)), [ref])
    return value
}
