import { makeStyles } from '@material-ui/core/styles'
import { InputBase } from '@material-ui/core'
import { useI18N } from '../../utils'

const useStyles = makeStyles(() => {
    return {
        root: {
            fontSize: 13,
            background: '#3a3b3c',
            width: '100%',
            height: 34,
            borderRadius: 20,
            padding: '2px 1em',
            boxSizing: 'border-box',
            marginTop: 6,
            color: '#e4e6eb',
        },
        input: {
            '&::placeholder': {
                color: '#b0b3b8',
                opacity: 1,
            },
            '&:focus::placeholder': {
                color: '#d0d2d6',
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
    const { t } = useI18N()
    return (
        <InputBase
            className={classes.root}
            inputProps={{ className: classes.input, 'data-testid': 'comment_input' }}
            placeholder={t('comment_box__placeholder')}
            onKeyDownCapture={(e) => {
                const node = e.target as HTMLInputElement
                if (!node.value) return
                if (e.key === 'Enter') {
                    props.onSubmit(node.value)
                    node.value = ''
                }
            }}
            {...props.inputProps}
        />
    )
}
