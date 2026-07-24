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
                border: '1px solid #d3dbe3',
                ...theme.applyStyles('dark', {
                    border: '1px solid #414c57',
                }),
                margin: '0 10px 10px',
                color: '#43434d',
                ...theme.applyStyles('dark', {
                    color: '#fff',
                }),
                fontWeight: 400,
            },
            input: {
                '&::placeholder': {
                    color: '#72727c',
                    ...theme.applyStyles('dark', {
                        color: '#b8c1c',
                    }),
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
