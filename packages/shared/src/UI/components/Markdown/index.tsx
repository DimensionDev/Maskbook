import { markdownTransformIpfsURL, purify } from '@masknet/shared-base'
import { memo } from 'react'
import ReactMarkdown, { Options } from 'react-markdown'
import { resolveIPFS_URL } from '@masknet/web3-shared-base'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'

import { makeStyles } from '@masknet/theme'
import { useRemarkable } from '../../../hooks/useRemarkable.js'

const useStyles = makeStyles()((theme) => ({
    markdown: {
        color: 'inherit',
        fontSize: 'inherit',
        fontFamily: 'sans-serif',
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

export interface LegacyMarkdownProps {
    content: string
    className?: string
}

export function LegacyMarkdown({ content, className }: LegacyMarkdownProps) {
    const { classes, cx } = useStyles()
    const html = purify(useRemarkable(content))
    return <div dangerouslySetInnerHTML={{ __html: html }} className={cx(classes.markdown, className)} />
}

interface MarkdownProps extends Options {
    defaultStyle?: boolean
}

export const Markdown = memo<MarkdownProps>(({ children, className, defaultStyle = true, ...props }) => {
    const { classes, cx } = useStyles()

    const markdown = markdownTransformIpfsURL(children)
    return (
        <ReactMarkdown
            className={cx(defaultStyle ? classes.markdown : undefined, className)}
            remarkPlugins={[[remarkGfm, { singleTilde: false }]]}
            rehypePlugins={[rehypeRaw]}
            transformImageUri={(src) => resolveIPFS_URL(src)!}
            linkTarget="_blank"
            {...props}>
            {markdown}
        </ReactMarkdown>
    )
})
