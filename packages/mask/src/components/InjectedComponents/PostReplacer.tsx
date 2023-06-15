import {
    type TransformationContext,
    type TypedMessage,
    isTypedMessageEqual,
    emptyTransformationContext,
    FlattenTypedMessage,
    forEachTypedMessageChild,
    isTypedMessageAnchor,
    makeTypedMessageText,
    isTypedMessageText,
} from '@masknet/typed-message'
import { TypedMessageRender, useTransformedValue } from '@masknet/typed-message-react'
import { makeStyles } from '@masknet/theme'
import { useEffect, useMemo, useState } from 'react'
import { usePostInfoDetails } from '@masknet/plugin-infra/content-script'
import { TypedMessageRenderContext } from '../../../shared-ui/TypedMessageRender/context.js'
import { useCurrentIdentity } from '../DataSource/useActivatedUI.js'
import { activatedSocialNetworkUI } from '../../social-network/ui.js'
import { produce } from 'immer'
import { MaskMessages } from '@masknet/shared-base'

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

    const [postMessage, setPostMessage] = useState(usePostInfoDetails.rawMessage())
    const iv = usePostInfoDetails.postIVIdentifier()
    useEffect(() => {
        if (postMessage?.meta || !iv?.toText()) return
        return MaskMessages.events.postReplacerHidden.on(() => {
            setPostMessage(
                produce((draft) => {
                    return { ...draft, items: [makeTypedMessageText('')] }
                }),
            )
        })
    }, [postMessage?.meta, iv?.toText])

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
            <TypedMessageRenderContext
                textResizer={activatedSocialNetworkUI.networkIdentifier !== 'twitter.com'}
                renderFragments={activatedSocialNetworkUI?.customization.componentOverwrite?.RenderFragments}
                context={initialTransformationContext}>
                <Transformer {...props} message={postMessage} />
            </TypedMessageRenderContext>
        </span>
    )
}

function Transformer({
    message,
    unzip,
    zip,
}: {
    message: TypedMessage
} & PostReplacerProps) {
    const after = useTransformedValue(message)

    const shouldReplace = useMemo(() => {
        const flatten = FlattenTypedMessage(message, emptyTransformationContext)
        if (!isTypedMessageEqual(flatten, after)) return true
        if (hasCashOrHashTag(after)) return true
        if (shouldHiddenPostReplacer(message)) return true
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

function shouldHiddenPostReplacer(message: TypedMessage): boolean {
    return isTypedMessageText(message) && message.content === ''
}
