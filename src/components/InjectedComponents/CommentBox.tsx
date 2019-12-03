import React, { useEffect, useRef } from 'react'
import { styled } from '@material-ui/core/styles'
import { useCapturedInput } from '../../utils/hooks/useCapturedEvents'
import { PropsOf } from '@emotion/styled-base/types/helper'

const Input = styled('input')({
    background: '#f2f3f5',
    border: '1px solid #ccd0d5',
    width: '100%',
    height: 34,
    borderRadius: 20,
    padding: '2px 1em',
    boxSizing: 'border-box',
    marginTop: 6,
})
export interface CommentBoxProps {
    onSubmit: (newVal: string) => void
    inputProps?: Partial<PropsOf<typeof Input>>
}
export function CommentBox(props: CommentBoxProps) {
    const inputRef = useRef<HTMLInputElement>(null)
    const binder = useCapturedInput(inputRef, () => {})
    useEffect(
        binder(['keypress'], e => {
            if (!inputRef.current) return
            if (e.key === 'Enter') {
                props.onSubmit(inputRef.current.value)
                inputRef.current.value = ''
            }
        }),
    )
    return <Input placeholder="Maskbook!" {...props.inputProps} ref={inputRef} />
}
