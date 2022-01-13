import { makeStyles } from '@masknet/theme'
import { useEffect } from 'react'
import { usePostInfoDetails } from '../DataSource/usePostInfo'
import './PayloadReplacer'
import { TypedMessageRender } from '@masknet/typed-message/dom'
import { TypedMessageRenderContext } from '../../../shared-ui/TypedMessageRender/context'
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
    const shouldReplacePost = true

    // zip/unzip original post
    useEffect(() => {
        if (shouldReplacePost) props.zip?.()
        else props.unzip?.()
    }, [shouldReplacePost])

    return shouldReplacePost ? (
        <span className={classes.root}>
            <TypedMessageRenderContext>
                <TypedMessageRender message={postMessage} />
            </TypedMessageRenderContext>
        </span>
    ) : null
}
