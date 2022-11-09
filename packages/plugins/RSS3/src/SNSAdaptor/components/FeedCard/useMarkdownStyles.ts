import { makeStyles } from '@masknet/theme'

/* eslint-disable tss-unused-classes/unused-classes */
export const useMarkdownStyles = makeStyles()((theme) => ({
    markdown: {
        wordBreak: 'break-all',
        img: {
            maxWidth: '100%',
        },
        a: {
            color: theme.palette.maskColor.highlight,
        },
    },
}))
