import type { ProposalIdentifier } from '../types'

export function useProposalIdentifier(url: string): ProposalIdentifier {
    const parsedURL = new URL(url)
    const [_, space, id] = parsedURL.hash.split('/')
    return {
        id,
        space: space.endsWith('.eth') ? space.replace(/.eth$/, '') : space,
    }
}
