import * as React from 'react'
import { makeStyles, Theme, useTheme } from '@material-ui/core'
import { styled } from '@material-ui/styles'

const TextField = styled('textarea')(({ theme }: { theme: Theme }) => ({
    background: theme.palette.background.default,
    color: theme.palette.text.hint,
    padding: `${theme.spacing(2)}px`,
    border: `1px solid ${theme.palette.divider}`,
    textAlign: 'start',
    whiteSpace: 'pre-line',
    borderRadius: theme.shape.borderRadius,
    fontSize: '1.15rem',
    wordBreak: 'break-all',
    display: 'block',
    resize: 'none',
    width: '100%',
    boxSizing: 'border-box',
}))
interface Props {
    provePost: string
}
const useStyles = makeStyles({ textField: { minHeight: '10em' } })
export default function Manual({ provePost }: Props) {
    const classes = useStyles()
    const theme = useTheme()
    const ref = React.createRef<HTMLTextAreaElement>()
    function onFocus() {
        setTimeout(() => {
            if (!ref.current) return
            ref.current.select()
        }, 20)
    }
    const onBlur = React.useCallback(() => {
        const selection = getSelection()
        if (!selection) return
        selection.removeAllRanges()
    }, [])
    return (
        <TextField
            ref={ref}
            readOnly
            onClick={onFocus}
            onFocus={onFocus}
            onBlur={onBlur}
            value={provePost}
            className={classes.textField}
        />
    )
}
