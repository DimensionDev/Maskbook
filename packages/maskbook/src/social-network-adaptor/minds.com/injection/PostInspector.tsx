import { createStyles, makeStyles } from '@material-ui/core'
import type { FC } from 'react'
import { injectPostInspectorDefault } from '../../../social-network/defaults/inject/PostInspector'
import type { PostInfo } from '../../../social-network/PostInfo'
import { Flags } from '../../../utils/flags'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot'

const map = new WeakMap<HTMLElement, ShadowRoot>()

function getShadowRoot(node: HTMLElement) {
    if (map.has(node)) return map.get(node)!
    const dom = node.attachShadow({ mode: Flags.using_ShadowDOM_attach_mode })
    map.set(node, dom)
    return dom
}

const useStyles = makeStyles((theme) =>
    createStyles({
        wrapper: {
            paddingRight: 21,
            paddingLeft: 21,
            paddingBottom: 16,
        },
    }),
)

const ActivityContentWrapper: FC<any> = ({ children }) => {
    const classes = useStyles()

    return <div className={classes.wrapper}>{children}</div>
}

export function injectPostInspectorAtMinds(signal: AbortSignal, current: PostInfo) {
    return injectPostInspectorDefault({
        zipPost(node) {
            zipEncryptedPostContent(current.rootNodeProxy.current.parentElement!)
        },
        render(jsx, postInfo) {
            const root = createReactRootShadowed(getShadowRoot(postInfo.postContentNode!), { signal })

            // Do not put non encrypted messages in the wrapper. Maybe there's a better solution?
            if (postInfo.postPayload.value.ok) {
                root.render(<ActivityContentWrapper>{jsx}</ActivityContentWrapper>)
            } else {
                root.render(jsx)
            }
            return root.destory
        },
    })(current, signal)
}

export function zipEncryptedPostContent(node: HTMLElement) {
    const image = node.querySelector<HTMLImageElement>('.m-activityContent__media--image')
    image?.remove()
    const mediaDescription = node.querySelector('.m-activityContent__mediaDescription')
    mediaDescription?.remove()
}
