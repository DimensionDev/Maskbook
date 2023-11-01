/* eslint-disable tss-unused-classes/unused-classes */
import { makeStyles } from '@masknet/theme'
import { injectCommentBoxDefaultFactory } from '../../../site-adaptor-infra/defaults/index.js'
import { pasteToCommentBoxMinds } from '../automation/pasteToCommentBoxMinds.js'
import type { PostContext } from '@masknet/plugin-infra/content-script'

export default function injectCommentBoxAtMinds(): (signal: AbortSignal, current: PostContext) => void {
    return injectCommentBoxDefaultFactory(
        pasteToCommentBoxMinds,
        (classes) => ({
            inputProps: {
                classes,
            },
        }),
        makeStyles()((theme) => ({
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
                color: theme.palette.mode === 'dark' ? '#fff' : '#43434d',
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
