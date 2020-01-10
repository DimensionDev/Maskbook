import React, { useEffect, useRef } from 'react'
import { useCapturedInput } from '../../utils/hooks/useCapturedEvents'
import { PropsOf } from '@emotion/styled-base/types/helper'
import { geti18nString } from '../../utils/i18n'
import { makeStyles } from '@material-ui/styles'
import { InputBase } from '@material-ui/core'

const useStyles = makeStyles(() => {
    return {
        root: {
            fontSize: 13,
            background: '#f2f3f5',
            border: '1px solid #ccd0d5',
            width: '100%',
            height: 34,
            borderRadius: 20,
            padding: '2px 1em',
            boxSizing: 'border-box',
            marginTop: 6,
        },
        input: {
            '&::placeholder': {
                color: '#8d949e',
                opacity: 1,
            },
            '&:focus::placeholder': {
                color: '#bec3c9',
            },
        },
    }
})

export interface CommentBoxProps {
    onSubmit: (newVal: string) => void
    inputProps?: Partial<PropsOf<typeof InputBase>>
}
export function CommentBox(props: CommentBoxProps) {
    const classes = useStyles()
    const [binder, inputRef] = useCapturedInput(() => {})
    useEffect(
        binder(['keypress'], e => {
            if (!inputRef.current) return
            if (e.key === 'Enter') {
                props.onSubmit(inputRef.current.value)
                inputRef.current.value = ''
            }
        }),
    )
    return (
        <InputBase
            className={classes.root}
            inputProps={{ className: classes.input, ref: inputRef }}
            placeholder={geti18nString('comment_box__placeholder')}
            {...props.inputProps}
        />
    )
}
