import type { ProposalIdentifier } from '../types.js'

export function getProposalIdentifier(url: string): ProposalIdentifier {
    const parsedURL = new URL(url)
    const [, space, , id] = parsedURL.hash.split('/')
    return {
        id,
        space,
    }
}

export function resolveSnapshotSpacePageUrl(spaceId: string) {
    return `https://snapshot.org/#/${spaceId}`
}

export function resolveSnapshotProposalUrl(spaceId: string, proposalId: string) {
    return `https://snapshot.org/#/${spaceId}/proposal/${proposalId}`
}
