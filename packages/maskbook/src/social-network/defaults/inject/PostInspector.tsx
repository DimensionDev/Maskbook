import { memo } from 'react'
import type { DOMProxy } from '@dimensiondev/holoflows-kit'
import type { PostInfo } from '../../PostInfo'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot'
import { PostInspector, PostInspectorProps } from '../../../components/InjectedComponents/PostInspector'
import { makeStyles } from '@material-ui/core'
import { PostInfoProvider } from '../../../components/DataSource/usePostInfo'
import { noop } from 'lodash-es'
import { AppendRecipients, useAppendRecipients } from '../../../components/DataSource/useAppendRecipients'
import { decodePublicKeyUI } from '../../utils/text-payload-ui'
import { useCurrentIdentity } from '../../../components/DataSource/useActivatedUI'
import { ProfileIdentifier } from '@masknet/shared'

export function injectPostInspectorDefault<T extends string>(
    config: InjectPostInspectorDefaultConfig = {},
    additionalPropsToPostInspector: (classes: Record<T, string>) => Partial<PostInspectorProps> = () => ({}),
    useCustomStyles: (props?: any) => Record<T, string> = makeStyles({}) as any,
) {
    const PostInspectorDefault = memo(function PostInspectorDefault(props: {
        onDecrypted: PostInspectorProps['onDecrypted']
        zipPost: PostInspectorProps['needZip']
    }) {
        const { onDecrypted, zipPost } = props
        const classes = useCustomStyles()
        const additionalProps = additionalPropsToPostInspector(classes)

        return (
            <AppendRecipients.Provider value={useAppendRecipients()}>
                <PostInspector
                    currentIdentity={useCurrentIdentity()?.identifier ?? ProfileIdentifier.unknown}
                    publicKeyUIDecoder={decodePublicKeyUI}
                    onDecrypted={onDecrypted}
                    needZip={zipPost}
                    {...additionalProps}
                />
            </AppendRecipients.Provider>
        )
    })

    const { zipPost, injectionPoint } = config
    const zipPostF = zipPost || noop
    return function injectPostInspector(current: PostInfo, signal: AbortSignal) {
        const jsx = (
            <PostInfoProvider post={current}>
                <PostInspectorDefault
                    onDecrypted={(typed) => {
                        current.transformedPostContent.value = typed
                    }}
                    zipPost={() => zipPostF(current.rootNodeProxy)}
                    {...current}
                />
            </PostInfoProvider>
        )
        const root = createReactRootShadowed(injectionPoint?.(current) ?? current.rootNodeProxy.afterShadow, {
            key: 'post-inspector',
            signal,
        })
        root.render(jsx)
        return root.destory
    }
}

interface InjectPostInspectorDefaultConfig {
    zipPost?(node: DOMProxy): void
    injectionPoint?: (postInfo: PostInfo) => ShadowRoot
}
