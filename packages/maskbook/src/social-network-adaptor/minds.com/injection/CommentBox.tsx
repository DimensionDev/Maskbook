import { makeStyles } from '@material-ui/core'
import { injectCommentBoxDefaultFactory } from '../../../social-network/defaults'
import { pasteToCommentBoxMinds } from '../automation/pasteToCommentBoxMinds'

export default function injectCommentBoxAtMinds() {
    return injectCommentBoxDefaultFactory(
        pasteToCommentBoxMinds,
        (classes) => ({
            inputProps: {
                classes,
            },
        }),
        makeStyles((theme) => ({
            root: {
                fontSize: 16,
                background: 'transparent',
                // FIXME: A weird issue with margins
                width: '96.2%',
                height: 44,
                borderRadius: 2,
                padding: '2px 1em',
                border: `1px solid ${theme.palette.mode === 'dark' ? '#414c57' : '#d3dbe3'}`,
                margin: '0 10px 10px',
                color: theme.palette.mode === 'dark' ? '#fff' : '#43434d', // TODO: maybe inherit?
                fontWeight: 400,
            },
            input: {
                '&::placeholder': {
                    color: theme.palette.mode === 'dark' ? '#b8c1c' : '#72727c',
                    opacity: 1,
                    fontWeight: 400,
                },
                '&:focus::placeholder': {
                    color: 'transparent',
                },
            },
        })),
    )
}
