import React, { useState, useEffect } from 'react'
import { useAsync } from 'react-use'
import { DecryptPost, DecryptPostProps } from './DecryptedPost/DecryptedPost'
import { AddToKeyStore, AddToKeyStoreProps } from './AddToKeyStore'
import { deconstructPayload } from '../../utils/type-transform/Payload'
import Services from '../../extension/service'
import { ProfileIdentifier, PostIdentifier } from '../../database/type'
import type { Profile } from '../../database'
import { useCurrentIdentity, useFriendsList } from '../DataSource/useActivatedUI'
import { getActivatedUI, PostInfo } from '../../social-network/ui'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { debugModeSetting } from '../shared-settings/settings'
import { DebugList } from '../DebugModeUI/DebugList'
import type { TypedMessage } from '../../extension/background-script/CryptoServices/utils'
import { PluginUI, PluginConfig } from '../../plugins/plugin'

// TODO: simplify this props @Jack-Works
export interface PostInspectorProps {
    onDecrypted(post: TypedMessage, raw: string): void
    post: string
    postInfo: PostInfo
    postBy: ProfileIdentifier
    postId: PostIdentifier<ProfileIdentifier>
    needZip(): void
    DecryptPostProps?: Partial<DecryptPostProps>
    DecryptPostComponent?: React.ComponentType<DecryptPostProps>
    AddToKeyStoreProps?: Partial<AddToKeyStoreProps>
    AddToKeyStoreComponent?: React.ComponentType<AddToKeyStoreProps>
}
export function PostInspector(props: PostInspectorProps) {
    const { post, postBy, postId, postInfo } = props
    const whoAmI = useCurrentIdentity()
    const people = useFriendsList()
    const [alreadySelectedPreviously, setAlreadySelectedPreviously] = useState<Profile[]>([])
    const decodeAsPublicKey = getActivatedUI().publicKeyDecoder(post)
    const isDebugging = useValueRef(debugModeSetting)
    const type = {
        encryptedPost: deconstructPayload(post, getActivatedUI().payloadDecoder),
        provePost: decodeAsPublicKey,
        extraCanvas: post.toLowerCase().includes('gitcoin'),
    }

    const { value: sharedListOfPost } = useAsync(async () => {
        if (!whoAmI || !whoAmI.identifier.equals(postBy) || !type.encryptedPost.ok) return []
        const { iv, version } = type.encryptedPost.val
        return Services.Crypto.getSharedListOfPost(version, iv, postBy)
    }, [post, postBy, whoAmI])
    useEffect(() => setAlreadySelectedPreviously(sharedListOfPost ?? []), [sharedListOfPost])

    if (postBy.isUnknown) return null

    const debugInfo = isDebugging ? (
        <DebugList
            items={[
                ['Post by', props.postBy.userId],
                [
                    'Who am I',
                    whoAmI ? `Nickname ${whoAmI.nickname || 'unknown'}, UserID ${whoAmI.identifier.userId}` : 'Unknown',
                ],
                ['My fingerprint', whoAmI?.linkedPersona?.fingerprint ?? 'Unknown'],
                ['Post ID', props.postId.toText() || 'Unknown'],
                ['Post Content', props.post],
            ]}
        />
    ) : null

    if (type.encryptedPost.ok) {
        if (!isDebugging) props.needZip()
        const { val } = type.encryptedPost
        const { iv, version } = val
        const ownersAESKeyEncrypted = val.version === -38 ? val.AESKeyEncrypted : val.ownersAESKeyEncrypted
        const DecryptPostX = props.DecryptPostComponent || DecryptPost
        return withAdditionalContent(
            <DecryptPostX
                onDecrypted={props.onDecrypted}
                requestAppendRecipients={
                    // Version -40 is leaking info
                    // So should not create new data on version -40
                    version === -40
                        ? undefined
                        : async (people) => {
                              setAlreadySelectedPreviously(alreadySelectedPreviously.concat(people))
                              return Services.Crypto.appendShareTarget(
                                  version,
                                  ownersAESKeyEncrypted,
                                  iv,
                                  people.map((x) => x.identifier),
                                  whoAmI!.identifier,
                                  { type: 'direct', at: new Date() },
                              )
                          }
                }
                alreadySelectedPreviously={alreadySelectedPreviously}
                profiles={people}
                postId={postId}
                encryptedText={post}
                whoAmI={whoAmI ? whoAmI.identifier : ProfileIdentifier.unknown}
                postBy={postBy}
                {...props.DecryptPostProps}
            />,
        )
    } else if (type.provePost.length) {
        const AddToKeyStoreX = props.AddToKeyStoreComponent || AddToKeyStore
        if (!AddToKeyStoreX) return null
        return withAdditionalContent(<AddToKeyStoreX postBy={postBy} provePost={post} {...props.AddToKeyStoreProps} />)
    }
    return withAdditionalContent(null)
    function withAdditionalContent(x: JSX.Element | null) {
        return (
            <>
                {x}
                <PluginPostInspector post={postInfo} />
                {debugInfo}
            </>
        )
    }
}
function PluginPostInspector(props: { post: PostInfo }) {
    return (
        <>
            {[...PluginUI.values()].map((x) => (
                <PluginPostInspectorForEach key={x.identifier} pluginConfig={x} post={props.post} />
            ))}
        </>
    )
}
function PluginPostInspectorForEach({ pluginConfig, post }: { post: PostInfo; pluginConfig: PluginConfig }) {
    const ref = React.useRef<HTMLDivElement>(null)
    const F = pluginConfig.postInspector
    React.useEffect(() => {
        if (!ref.current || !F || typeof F === 'function') return
        return F.init(post, ref.current)
    }, [F, post])
    if (!F) return null
    if (typeof F === 'function') return <F {...post} />
    return <div ref={ref} />
}
