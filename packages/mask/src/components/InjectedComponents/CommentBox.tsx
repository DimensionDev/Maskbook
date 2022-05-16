import { makeStyles } from '@masknet/theme'
import { Box, InputBase } from '@mui/material'
import { activatedSocialNetworkUI } from '../../social-network'
import { useI18N } from '../../utils'
import { EnhanceableSite } from '@masknet/shared-base'

interface StyleProps {
    snsId: string
}

const useStyles = makeStyles<StyleProps>()((theme, { snsId }) => ({
    root: {
        flex: 1,
        fontSize: 13,
        background: '#3a3b3c',
        width: snsId === EnhanceableSite.Minds ? '96%' : '100%',
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
}))

export interface CommentBoxProps {
    onSubmit: (newVal: string) => void
    inputProps?: Partial<PropsOf<typeof InputBase>>
}
export function CommentBox(props: CommentBoxProps) {
    const { classes } = useStyles({ snsId: activatedSocialNetworkUI.networkIdentifier })
    const { t } = useI18N()
    return (
        <Box sx={{ display: 'flex', width: '100%' }}>
            <InputBase
                className={classes.root}
                inputProps={{ className: classes.input, 'data-testid': 'comment_input' }}
                placeholder={t('comment_box__placeholder')}
                onKeyDown={(event) => {
                    const node = event.target as HTMLInputElement
                    if (!node.value) return
                    if (event.key !== 'Enter') return
                    props.onSubmit(node.value)
                    node.value = '' // clear content
                }}
                {...props.inputProps}
            />
        </Box>
    )
}
