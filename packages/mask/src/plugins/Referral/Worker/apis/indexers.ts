/* eslint-disable @typescript-eslint/no-loop-func */
/* eslint-disable no-return-await */

import { getDiscovery } from './discovery'

import type { Bytes32, EvmAddress, Geolocation, Airport, Node } from '../../types'

// Nearest Node
const toRad = (num: number): number => {
    return (num * Math.PI) / 100
}

function haversine(start: Geolocation, end: Geolocation): number {
    const R = 6371

    const dLat = toRad(end.lat - start.lat)
    const dLon = toRad(end.lon - start.lon)
    const lat1 = toRad(start.lat)
    const lat2 = toRad(end.lat)

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
}

export function selectNearestNode(nodes: Node[], airports: Airport[], pop: string) {
    const iata = pop.slice(0, 3)
    const popc = airports.find((ap) => ap.iata === iata)

    if (popc) {
        let nearest

        for (const [i] of nodes.entries()) {
            const n = nodes[i]
            if (!n.location || !n.location.lat || !n.location.lon) {
                continue
            }

            const d = haversine(popc, n.location)
            if (!nearest || d < nearest.d) {
                nearest = { d, n }
            }
        }

        if (nearest) {
            return nearest.n
        }
    }

    // No nearest found, it's up to the caller to implement another node selection strategy.
    return null
}

export function getNearestAndRemainingNodes(
    nodes: Node[],
    airports: Airport[],
    pop: string,
    nearestNodeAmount: number,
) {
    let remainingNodes = nodes

    // get N nearest nodes
    const nearestNodes: Node[] = []
    for (let i = 0; i < nearestNodeAmount; i += 1) {
        const nearestNode = selectNearestNode(remainingNodes, airports, pop)

        if (nearestNode) {
            nearestNodes.push(nearestNode)
            // filter out a node that is in nearest nodes already
            remainingNodes = remainingNodes.filter((node) => node.url !== nearestNode.url)
        }
    }

    return {
        nearestNodes,
        remainingNodes,
    }
}

async function findQuorum(nodes: Node[], airports: Airport[], pop: string, urlPath: string, minQuorum: number) {
    let responses: any[] = []
    let nodeCount = minQuorum

    // query another nodes among the remaining nodes until quorum is reached
    while (responses.length < minQuorum) {
        if (!nodes.length) {
            break
        }

        const { remainingNodes, nearestNodes } = getNearestAndRemainingNodes(nodes, airports, pop, nodeCount)

        const settledResponses = await Promise.allSettled(
            nearestNodes.map(async (node) => await (await fetch(`${node.url}${urlPath}`)).json()),
        )
        // filter out failed  responses
        responses = [...responses, ...settledResponses.filter((response) => response.status === 'fulfilled')]

        nodeCount = minQuorum - responses.length
        nodes = remainingNodes
    }

    return responses
}

export async function queryIndexersWithNearestQuorum(searchParams: LogParams): Promise<any> {
    const urlPath = makeIndexerUrlPath(searchParams)
    const { discovery, pop } = await getDiscovery()
    const minQuorum = 1

    const responses = await findQuorum(discovery.indexers, discovery.airports, pop, urlPath, minQuorum)

    if (!responses.length) {
        throw new Error('Node request error')
    }

    return responses[0].value
}

interface LogParams {
    // Logs from these addresses only
    addresses?: EvmAddress[]
    // Search across all topics
    topics?: Bytes32[]
    // Topic1 is commonly the event id
    topic1?: Bytes32[]
    // Topics 2-4 are the 1-3 indexed event params
    topic2?: Bytes32[]
    topic3?: Bytes32[]
    topic4?: Bytes32[]
    // Logs from these chains only
    chainId?: number[]
    // Logs from these transactions only
    transactionHash?: Bytes32[]
    // Default AND search is done by the indexers
    strategy?: 'AND' | 'OR'
}

export function makeIndexerUrlPath(params: LogParams) {
    const parts = []
    if (params.addresses) params.addresses.forEach((d) => parts.push(`address=${d}`))
    if (params.topics) params.topics.forEach((d) => parts.push(`topic=${d}`))
    if (params.topic1) params.topic1.forEach((d) => parts.push(`topic1=${d}`))
    if (params.topic2) params.topic2.forEach((d) => parts.push(`topic2=${d}`))
    if (params.topic3) params.topic3.forEach((d) => parts.push(`topic3=${d}`))
    if (params.topic4) params.topic4.forEach((d) => parts.push(`topic4=${d}`))
    if (params.chainId) params.chainId.forEach((d) => parts.push(`chainId=${d}`))
    if (params.transactionHash) params.transactionHash.forEach((d) => parts.push(`transactionHash=${d}`))
    if (params.strategy) parts.push(`strategy=${params.strategy}`)

    return `/v1/logsearch?${parts.join('&')}`
}
