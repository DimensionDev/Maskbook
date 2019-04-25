import * as React from 'react'
import { withStylesTyped } from '../../utils/theme'
import createStyles from '@material-ui/core/styles/createStyles'
import { createBox } from '../../utils/components/Flex'

const TextField = createBox(
    theme => ({
        background: theme.palette.background.default,
        color: theme.palette.text.hint,
        padding: `${theme.spacing.unit * 2}px`,
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
    }),
    'textarea',
)
interface Props {
    provePost: string
}
export default withStylesTyped(createStyles({ textField: { minHeight: '10em' } }))<Props>(function Manual({
    classes,
    provePost,
}) {
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
})
