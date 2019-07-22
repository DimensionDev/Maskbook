import React, { useEffect, useState } from 'react'
import { styled } from '@material-ui/core/styles'
import { useCapturedInput } from '../../utils/hooks/useCapturedEvents'

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
export function CommentBox(props: { onSubmit(newVal: string): void; display: boolean }) {
    const ref = React.createRef<HTMLInputElement>()
    const binder = useCapturedInput(ref, () => {})
    useEffect(
        binder(['keypress'], e => {
            if (!ref.current) return
            if (e.key === 'Enter') {
                props.onSubmit(ref.current.value)
                ref.current.value = ''
            }
        }),
    )
    if (!props.display) return null
    return <Input ref={ref} placeholder="Maskbook!" />
}
