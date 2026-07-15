import {
    usePostInfoAuthor,
    usePostInfoPostIVIdentifier,
    usePostInfoRawMessage,
    usePostInfoURL,
} from '@masknet/plugin-infra/content-script'
import { DirtyDetection, useDirtyDetection } from '@masknet/plugin-infra/dom'
import {
    EXIST_EVM_ADDRESS_RE,
    EXIST_SOLANA_ADDRESS_RE,
    EXIST_TORN_ADDRESS_RE,
    MaskMessages,
} from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import {
    type TransformationContext,
    type TypedMessage,
    emptyTransformationContext,
    FlattenTypedMessage,
    forEachTypedMessageChild,
    isTypedMessageAnchor,
    isTypedMessageEqual,
    isTypedMessageText,
    makeTypedMessageText,
} from '@masknet/typed-message'
import { TypedMessageRender, useTransformedValue } from '@masknet/typed-message-react'
import { produce } from 'immer'
import { useEffect, useMemo, useState } from 'react'
import { TypedMessageRenderContext } from '../../../shared-ui/TypedMessageRender/context.js'
import { activatedSiteAdaptorUI } from '../../site-adaptor-infra/ui.js'
import { useCurrentIdentity } from '../DataSource/useActivatedUI.js'

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
                <DirtyDetection>
                    <Transformer {...props} message={postMessage} />
                </DirtyDetection>
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

    const staticGuess = useMemo(() => {
        const flatten = FlattenTypedMessage(message, emptyTransformationContext)
        if (!isTypedMessageEqual(flatten, after)) return true
        if (hasCashOrHashTag(after)) return true
        if (shouldHiddenPostReplacer(message)) return true
        if (hasAddresses(message)) return true
        return false
    }, [message, after])

    const { isDirty, isPending } = useDirtyDetection()

    const shouldReplace = staticGuess ? isPending || isDirty : false
    useEffect(() => {
        if (isPending) return
        if (shouldReplace) zip?.()
        else unzip?.()

        return () => unzip?.()
    }, [shouldReplace, isPending])

    if (shouldReplace || isDirty) {
        const rendered = <TypedMessageRender message={after} />
        if (isPending) return <div style={{ display: 'none' }}>{rendered}</div>
        return rendered
    }
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

function hasAddresses(message: TypedMessage): boolean {
    let result = false
    function visitor(node: TypedMessage): 'stop' | void {
        if (result) return
        if (!isTypedMessageText(node)) return
        const content = node.content
        const hasAddresses =
            EXIST_EVM_ADDRESS_RE.test(content) ||
            EXIST_SOLANA_ADDRESS_RE.test(content) ||
            EXIST_TORN_ADDRESS_RE.test(content)
        result ||= hasAddresses
    }
    visitor(message)
    forEachTypedMessageChild(message, visitor)
    return result
}

function shouldHiddenPostReplacer(message: TypedMessage): boolean {
    return isTypedMessageText(message) && message.content === ''
}
