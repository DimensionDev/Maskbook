import { makeStyles } from '@masknet/theme'
import { useEffect, useMemo } from 'react'
import { usePostInfoDetails } from '../DataSource/usePostInfo'
import { TypedMessageRender, useTransformedValue } from '@masknet/typed-message/dom'
import { TypedMessageRenderContext } from '../../../shared-ui/TypedMessageRender/context'
import type { TransformationContext, TypedMessage } from '@masknet/typed-message/base'
import { useCurrentIdentity } from '../DataSource/useActivatedUI'
const useStyles = makeStyles()({
    root: {
        overflowWrap: 'break-word',
    },
})

export interface PostReplacerProps {
    zip?: () => void
    unzip?: () => void
}

export function PostReplacer(props: PostReplacerProps) {
    const { classes } = useStyles()
    const postMessage = usePostInfoDetails.rawMessage()
    const author = usePostInfoDetails.author()
    const currentProfile = useCurrentIdentity()?.identifier
    const url = usePostInfoDetails.url()

    const shouldReplacePost = true
    const initialTransformationContext = useMemo((): TransformationContext => {
        return {
            authorHint: author,
            currentProfile,
            postURL: url?.toString(),
        }
    }, [author, currentProfile, url])

    // zip/unzip original post
    useEffect(() => {
        if (shouldReplacePost) props.zip?.()
        else props.unzip?.()
    }, [shouldReplacePost])

    return shouldReplacePost ? (
        <span className={classes.root}>
            <TypedMessageRenderContext context={initialTransformationContext}>
                <Transformer message={postMessage} />
            </TypedMessageRenderContext>
        </span>
    ) : null
}
function Transformer(props: { message: TypedMessage }) {
    const after = useTransformedValue(props.message)
    return <TypedMessageRender message={after} />
}
