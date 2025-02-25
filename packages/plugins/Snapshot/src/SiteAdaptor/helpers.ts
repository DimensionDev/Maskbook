import type { ProposalIdentifier } from '../types.js'

export function getProposalIdentifier(url: string): ProposalIdentifier {
    const parsedURL = new URL(url)
    const [, space, , id] = parsedURL.hash.split('/')
    if (id.match(/^\d+$/)) {
        return {
            id: `${space.split(':').pop()}/${id}`,
            space,
        }
    }
    return {
        id,
        space,
    }
}

export function resolveSnapshotSpacePageUrl(spaceId: string) {
    return `https://snapshot.box/#/${spaceId}`
}

export function resolveSnapshotProposalUrl(spaceId: string, proposalId: string) {
    return `https://snapshot.box/#/${spaceId}/proposal/${proposalId}`
}

export function formatLongHex(hex: string) {
    return hex.slice(0, 6) + '...' + hex.slice(-4)
}

export function formatSpaceId(spaceId: string) {
    if (spaceId.startsWith('0x') && spaceId.length === 66) return `${spaceId.slice(0, 6)}...${spaceId.slice(-4)}`
    return `0x${spaceId}`
}
