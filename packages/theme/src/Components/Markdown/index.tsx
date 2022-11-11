import { markdownTransformIpfsURL } from '@masknet/shared-base'
import { memo, use, lazy } from 'react'
import type {} from 'react/next'
import type { Options } from 'react-markdown'
export type { Options } from 'react-markdown'

// Note: this 3 dependencies crashes in background script. we need to lazy load it until use.
const ReactMarkdown = lazy(() => import('react-markdown'))
// TODO Succeed another Markdown in '@masknet/shared'
export const Markdown = memo<Options>(function Markdown({ children, ...props }) {
    const remarkGfm = use(import('remark-gfm').then((x) => x.default))
    const rehypeRaw = use(import('rehype-raw').then((x) => x.default))
    const markdown = markdownTransformIpfsURL(children)
    return (
        <ReactMarkdown remarkPlugins={[[remarkGfm, { singleTilde: false }]]} rehypePlugins={[rehypeRaw]} {...props}>
            {markdown}
        </ReactMarkdown>
    )
})
