import { Mirror } from '@masknet/web3-providers'
import { ProfileIdentifier, type SocialIdentity } from '@masknet/shared-base'
import { mirrorBase } from '../base.js'
import { getMirrorProfileUrl } from '../collecting/utils.js'

export async function getUserIdentity(userAddress: string): Promise<SocialIdentity | undefined> {
    if (!userAddress) return
    const writer = await Mirror.getWriter(userAddress)
    if (!writer) return

    return {
        avatar: writer.avatarURL,
        nickname: writer.displayName,
        identifier: ProfileIdentifier.of(mirrorBase.networkIdentifier, writer.address).unwrapOr(undefined),
        bio: writer.description,
        homepage: writer.domain || getMirrorProfileUrl(writer.address),
    }
}

/**
 * Could be ENS or address
 */
export function getAuthorWallet() {
    let authorWallet = location.pathname.split('/')[1].toLowerCase()
    const matches = location.hostname.match(/(.*)\.mirror\.xyz$/)
    authorWallet = matches ? `${matches[1]}.eth` : authorWallet
    return authorWallet
}
