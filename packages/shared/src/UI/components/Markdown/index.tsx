/// <reference types="@masknet/global-types/dom" />
import { markdownTransformIpfsURL } from '@masknet/shared-base'
import { memo } from 'react'
import type { Options } from 'react-markdown'
import { resolveIPFS_URL } from '@masknet/web3-shared-base'

import { makeStyles } from '@masknet/theme'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import external from 'rehype-external-links'

const useStyles = makeStyles()((theme) => ({
    markdown: {
        color: 'inherit',
        fontSize: 'inherit',
        fontFamily: 'sans-serif',
        '& blockquote': {
            display: 'contents',
        },
        '& p, & li': {
            margin: 0,
            fontSize: 12,
            color: theme.palette.text.secondary,
        },
        '& p + p': {
            marginTop: theme.spacing(0.5),
        },
        '& h1, & h2, & h3, & h4, & h5, & h6': {
            fontSize: 14,
            fontWeight: 500,
        },
        '& img': {
            maxWidth: '100%',
        },
        '& a': {
            color: theme.palette.text.primary,
        },
    },
}))

interface MarkdownProps extends Options {
    defaultStyle?: boolean
    children: string
}

export const Markdown = memo<MarkdownProps>(function Markdown({ children, className, defaultStyle = true, ...props }) {
    const { classes, cx } = useStyles()

    const markdown = markdownTransformIpfsURL(children)
    return (
        <ReactMarkdown
            className={cx(defaultStyle ? classes.markdown : undefined, className)}
            remarkPlugins={[[remarkGfm, { singleTilde: false }]]}
            rehypePlugins={[rehypeRaw, external]}
            urlTransform={(src) => resolveIPFS_URL(src)!}
            {...props}>
            {markdown}
        </ReactMarkdown>
    )
})
