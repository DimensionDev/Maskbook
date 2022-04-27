import {
    type TransformationContext,
    type TypedMessage,
    isTypedMessageEqual,
    emptyTransformationContext,
    FlattenTypedMessage,
    forEachTypedMessageChild,
    isTypedMessageAnchor,
} from '@masknet/typed-message'
import { TextResizeContext, TypedMessageRender, useTransformedValue } from '@masknet/typed-message/dom'
import { makeStyles } from '@masknet/theme'
import { useEffect, useMemo } from 'react'
import { usePostInfoDetails } from '@masknet/plugin-infra/content-script'
import { TypedMessageRenderContext } from '../../../shared-ui/TypedMessageRender/context'
import { useCurrentIdentity } from '../DataSource/useActivatedUI'
import { activatedSocialNetworkUI } from '../../social-network/ui'

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

    const initialTransformationContext = useMemo((): TransformationContext => {
        return {
            authorHint: author || undefined,
            currentProfile,
            postURL: url?.toString(),
        }
    }, [author, currentProfile, url])

    return (
        <span className={classes.root}>
            <TextResizeContext.Provider value>
                <TypedMessageRenderContext
                    renderFragments={activatedSocialNetworkUI?.customization.componentOverwrite?.RenderFragments}
                    context={initialTransformationContext}>
                    <Transformer {...props} message={postMessage} />
                </TypedMessageRenderContext>
            </TextResizeContext.Provider>
        </span>
    )
}

function Transformer({ message, unzip, zip }: { message: TypedMessage } & PostReplacerProps) {
    const after = useTransformedValue(message)

    const shouldReplace = useMemo(() => {
        const flatten = FlattenTypedMessage(message, emptyTransformationContext)
        if (!isTypedMessageEqual(flatten, after)) return true
        if (hasCashOrHashTag(after)) return true
        return false
    }, [message, after])

    useEffect(() => {
        if (shouldReplace) zip?.()
        else unzip?.()

        return () => unzip?.()
    }, [])

    if (shouldReplace) return <TypedMessageRender message={after} />
    return null
}
function hasCashOrHashTag(message: TypedMessage): boolean {
    let result = false
    function visitor(node: TypedMessage): 'stop' | void {
        if (isTypedMessageAnchor(node)) {
            if (node.category === 'cash' || node.category === 'hash') {
                result = true
                return 'stop'
            }
        } else forEachTypedMessageChild(node, visitor)
    }
    visitor(message)
    forEachTypedMessageChild(message, visitor)
    return result
}
