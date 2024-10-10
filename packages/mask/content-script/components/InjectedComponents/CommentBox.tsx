import { makeStyles } from '@masknet/theme'
import { Box, InputBase } from '@mui/material'
import { activatedSiteAdaptorUI } from '../../site-adaptor-infra/index.js'
import { EnhanceableSite } from '@masknet/shared-base'
import { msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

interface StyleProps {
    site: EnhanceableSite
}

const useStyles = makeStyles<StyleProps>()((_theme, { site }) => ({
    root: {
        flex: 1,
        fontSize: 13,
        background: '#3a3b3c',
        width: site === EnhanceableSite.Minds ? '96%' : '100%',
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
    const { _ } = useLingui()
    const { classes } = useStyles({ site: activatedSiteAdaptorUI!.networkIdentifier })
    return (
        <Box sx={{ display: 'flex', width: '100%' }}>
            <InputBase
                className={classes.root}
                inputProps={{ className: classes.input, 'data-testid': 'comment_input' }}
                placeholder={_(msg`Add an encrypted comment...`)}
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
