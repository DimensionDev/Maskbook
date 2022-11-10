import { markdownTransformIpfsURL } from '@masknet/shared-base'
import { memo } from 'react'
import ReactMarkdown, { Options } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'

interface Props extends Options {}

// TODO Succeed another Markdown in '@masknet/shared'
export const Markdown = memo<Props>(({ children, ...props }) => {
    const markdown = markdownTransformIpfsURL(children)
    return (
        <ReactMarkdown remarkPlugins={[[remarkGfm, { singleTilde: false }]]} rehypePlugins={[rehypeRaw]} {...props}>
            {markdown}
        </ReactMarkdown>
    )
})
