import type { TransformationContext, TypedMessage } from '@masknet/typed-message'
import { TextEnlargeContext, TypedMessageRender, useTransformedValue } from '@masknet/typed-message/dom'
import { makeStyles } from '@masknet/theme'
import { useEffect, useMemo } from 'react'
import { usePostInfoDetails } from '../DataSource/usePostInfo'
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

export function PostReplacer({ unzip, zip }: PostReplacerProps) {
    const { classes } = useStyles()
    const postMessage = usePostInfoDetails.rawMessage()

    const author = usePostInfoDetails.author()
    const currentProfile = useCurrentIdentity()?.identifier
    const url = usePostInfoDetails.url()

    // zip/unzip original post
    useEffect(() => {
        zip?.()
        return () => unzip?.()
    }, [])

    const initialTransformationContext = useMemo((): TransformationContext => {
        return {
            authorHint: author,
            currentProfile,
            postURL: url?.toString(),
        }
    }, [author, currentProfile, url])

    return (
        <span className={classes.root}>
            <TextEnlargeContext.Provider value>
                <TypedMessageRenderContext
                    renderFragments={activatedSocialNetworkUI?.customization.componentOverwrite?.RenderFragments}
                    context={initialTransformationContext}>
                    <Transformer message={postMessage} />
                </TypedMessageRenderContext>
            </TextEnlargeContext.Provider>
        </span>
    )
}

function Transformer(props: { message: TypedMessage }) {
    const after = useTransformedValue(props.message)
    return <TypedMessageRender message={after} />
}
