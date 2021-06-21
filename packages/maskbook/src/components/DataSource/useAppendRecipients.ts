import { delay, PayloadAlpha38, PayloadAlpha40_Or_Alpha39 } from '@masknet/shared'
import { createContext, useEffect, useState } from 'react'
import { useAsync } from 'react-use'
import type { Profile } from '../../database'
import Services from '../../extension/service'
import { useCurrentIdentity, useFriendsList } from './useActivatedUI'
import { usePostInfoDetails } from './usePostInfo'

export type AppendRecipients = {
    requestAppend(profile: Profile[]): Promise<void>
    alreadySelectedPreviously: Profile[]
    friends: Profile[]
    enabled: boolean
}
export const AppendRecipients = createContext<AppendRecipients>({
    alreadySelectedPreviously: [],
    friends: [],
    async requestAppend() {},
    enabled: false,
})
export function useAppendRecipients(): AppendRecipients {
    const postBy = usePostInfoDetails.postBy()
    const whoAmI = useCurrentIdentity()
    const encryptedPost = usePostInfoDetails.postPayload()
    const decryptedPayloadForImage = usePostInfoDetails.decryptedPayloadForImage()
    const postImages = usePostInfoDetails.postMetadataImages()
    const [alreadySelectedPreviously, setAlreadySelectedPreviously] = useState<Profile[]>([])

    const { value: sharedListOfPost } = useAsync(async () => {
        if (!whoAmI || !whoAmI.identifier.equals(postBy) || !encryptedPost.ok) return []
        const { iv, version } = encryptedPost.val
        return Services.Crypto.getSharedListOfPost(version, iv, postBy)
    }, [postBy, whoAmI, encryptedPost])
    useEffect(() => setAlreadySelectedPreviously(sharedListOfPost ?? []), [sharedListOfPost])

    const enabled =
        ((encryptedPost.ok && encryptedPost.val.version !== -40) || Boolean(decryptedPayloadForImage)) &&
        postBy.equals(whoAmI?.identifier)
    return {
        alreadySelectedPreviously,
        enabled,
        friends: useFriendsList(),
        requestAppend: async function share(profile: Profile[]) {
            await delay(1500)
            const val = (postImages ? decryptedPayloadForImage : encryptedPost.val) as
                | PayloadAlpha40_Or_Alpha39
                | PayloadAlpha38

            const { iv, version } = val
            const ownersAESKeyEncrypted = val.version === -38 ? val.AESKeyEncrypted : val.ownersAESKeyEncrypted

            setAlreadySelectedPreviously(alreadySelectedPreviously.concat(profile))

            return Services.Crypto.appendShareTarget(
                version,
                ownersAESKeyEncrypted,
                iv,
                profile.map((x) => x.identifier),
                whoAmI!.identifier,
                { type: 'direct', at: new Date() },
            )
        },
    }
}
