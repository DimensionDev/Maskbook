import { makeStyles } from '@masknet/theme'

/* eslint-disable tss-unused-classes/unused-classes */
export const useMarkdownStyles = makeStyles()((theme) => ({
    markdown: {
        wordBreak: 'break-all',
        overflow: 'auto',
        color: 'inherit',
        fontSize: 'inherit',
        fontFamily: 'sans-serif',
        img: {
            maxWidth: '100%',
        },
        a: {
            color: theme.palette.maskColor.highlight,
        },
        pre: {
            overflow: 'auto',
        },
        p: {
            color: theme.palette.text.secondary,
        },
        '& p, & li': {
            fontSize: 14,
        },
    },
}))
