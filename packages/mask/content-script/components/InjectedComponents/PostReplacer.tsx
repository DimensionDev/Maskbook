import { useEffect, useMemo, useState } from 'react'
import { produce } from 'immer'
import { makeStyles } from '@masknet/theme'
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
import { MaskMessages } from '@masknet/shared-base'
import { TypedMessageRender, useTransformedValue } from '@masknet/typed-message-react'
import {
    usePostInfoAuthor,
    usePostInfoPostIVIdentifier,
    usePostInfoRawMessage,
    usePostInfoURL,
} from '@masknet/plugin-infra/content-script'
import { TypedMessageRenderContext } from '../../../shared-ui/TypedMessageRender/context.js'
import { useCurrentIdentity } from '../DataSource/useActivatedUI.js'
import { activatedSiteAdaptorUI } from '../../site-adaptor-infra/ui.js'

const useStyles = makeStyles()({
    root: {
        overflowWrap: 'break-word',
    },
})

export interface PostReplacerProps {
    zip: () => void
    unzip: () => void
}

export function PostReplacer(props: PostReplacerProps) {
    const { classes } = useStyles()

    const initialPostMessage = usePostInfoRawMessage()
    const [postMessage, setPostMessage] = useState(initialPostMessage)
    const iv = usePostInfoPostIVIdentifier()
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

    const author = usePostInfoAuthor()
    const currentProfile = useCurrentIdentity()?.identifier
    const url = usePostInfoURL()

    const initialTransformationContext = useMemo((): TransformationContext => {
        return {
            authorHint: author || undefined,
            currentProfile,
            postURL: url?.href,
        }
    }, [author, currentProfile, url])

    return (
        <span className={classes.root}>
            <TypedMessageRenderContext
                textResizer={activatedSiteAdaptorUI!.networkIdentifier !== 'twitter.com'}
                renderFragments={activatedSiteAdaptorUI?.customization.componentOverwrite?.RenderFragments}
                context={initialTransformationContext}>
                <Transformer {...props} message={postMessage} />
            </TypedMessageRenderContext>
        </span>
    )
}

function Transformer({
    message,
    zip,
    unzip,
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
