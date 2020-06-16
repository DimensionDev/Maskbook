import React, { useState, useEffect, useMemo } from 'react'
import { useAsync } from 'react-use'
import { DecryptPost, DecryptPostProps } from './DecryptedPost/DecryptedPost'
import { AddToKeyStore, AddToKeyStoreProps } from './AddToKeyStore'
import { deconstructPayload } from '../../utils/type-transform/Payload'
import Services from '../../extension/service'
import { ProfileIdentifier } from '../../database/type'
import type { Profile } from '../../database'
import { useCurrentIdentity, useFriendsList } from '../DataSource/useActivatedUI'
import { getActivatedUI } from '../../social-network/ui'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { debugModeSetting } from '../shared-settings/settings'
import { DebugList } from '../DebugModeUI/DebugList'
import type { TypedMessage } from '../../extension/background-script/CryptoServices/utils'
import { PluginUI, PluginConfig } from '../../plugins/plugin'
import { usePostInfoDetails, usePostInfo } from '../DataSource/usePostInfo'

export interface PostInspectorProps {
    onDecrypted(post: TypedMessage, raw: string): void
    needZip(): void
    DecryptPostProps?: Partial<DecryptPostProps>
    DecryptPostComponent?: React.ComponentType<DecryptPostProps>
    AddToKeyStoreProps?: Partial<AddToKeyStoreProps>
    AddToKeyStoreComponent?: React.ComponentType<AddToKeyStoreProps>
}
export function PostInspector(props: PostInspectorProps) {
    const postBy = usePostInfoDetails('postBy')
    const post = usePostInfoDetails('postContent')
    const postId = usePostInfoDetails('postIdentifier')
    const isDebugging = useValueRef(debugModeSetting)
    const whoAmI = useCurrentIdentity()
    const friends = useFriendsList()

    const [alreadySelectedPreviously, setAlreadySelectedPreviously] = useState<Profile[]>([])

    const encryptedPost = useMemo(() => deconstructPayload(post, getActivatedUI().payloadDecoder), [post])
    const provePost = useMemo(() => getActivatedUI().publicKeyDecoder(post), [post])

    const { value: sharedListOfPost } = useAsync(async () => {
        if (!whoAmI || !whoAmI.identifier.equals(postBy) || !encryptedPost.ok) return []
        const { iv, version } = encryptedPost.val
        return Services.Crypto.getSharedListOfPost(version, iv, postBy)
    }, [post, postBy, whoAmI])
    useEffect(() => setAlreadySelectedPreviously(sharedListOfPost ?? []), [sharedListOfPost])

    if (postBy.isUnknown) return null

    const debugInfo = isDebugging ? (
        <DebugList
            items={[
                ['Post by', postBy.userId],
                [
                    'Who am I',
                    whoAmI ? `Nickname ${whoAmI.nickname || 'unknown'}, UserID ${whoAmI.identifier.userId}` : 'Unknown',
                ],
                ['My fingerprint', whoAmI?.linkedPersona?.fingerprint ?? 'Unknown'],
                ['Post ID', postId?.toText() || 'Unknown'],
                ['Post Content', post],
            ]}
        />
    ) : null

    if (encryptedPost.ok) {
        if (!isDebugging) props.needZip()
        const { val } = encryptedPost
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
                profiles={friends}
                encryptedText={post}
                whoAmI={whoAmI ? whoAmI.identifier : ProfileIdentifier.unknown}
                {...props.DecryptPostProps}
            />,
        )
    } else if (provePost.length) {
        const AddToKeyStoreX = props.AddToKeyStoreComponent || AddToKeyStore
        if (!AddToKeyStoreX) return null
        return withAdditionalContent(<AddToKeyStoreX postBy={postBy} provePost={post} {...props.AddToKeyStoreProps} />)
    }
    return withAdditionalContent(null)
    function withAdditionalContent(x: JSX.Element | null) {
        return (
            <>
                {x}
                <PluginPostInspector />
                {debugInfo}
            </>
        )
    }
}
function PluginPostInspector() {
    return (
        <>
            {[...PluginUI.values()].map((x) => (
                <PluginPostInspectorForEach key={x.identifier} config={x} />
            ))}
        </>
    )
}
function PluginPostInspectorForEach({ config }: { config: PluginConfig }) {
    const ref = React.useRef<HTMLDivElement>(null)
    const F = config.postInspector
    const post = usePostInfo()
    React.useEffect(() => {
        if (!ref.current || !F || typeof F === 'function') return
        return F.init(post, {}, ref.current)
    }, [F, post])
    if (!F) return null
    if (typeof F === 'function') return <F />
    return <div ref={ref} />
}
