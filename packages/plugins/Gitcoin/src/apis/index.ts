// cSpell:disable
import { fetchCachedJSON } from '@masknet/web3-providers/helpers'
import { GITCOIN_API_GRANTS_V1 } from '../constants.js'
import { last } from 'lodash-es'

const projectQuery = `
  query ($alloVersion: [String!]!, $projectId: String!) {
    projects(
      first: 100
      filter: {
        tags: { equalTo: $alloVersion }
        not: { tags: { contains: "program" } }
        id: { equalTo: $projectId }
      }
    ) {
      id
      chainId
      metadata
      metadataCid
      name
      nodeId
      projectNumber
      registryAddress
      tags
      nonce
      anchorAddress
      projectType
      roles(first: 1000) {
        address
        role
        createdAtBlock
      }
    }
  }
`

const applicationsQuery = `
query getApprovedApplicationsByProjectIds($projectIds: [String!]!) {
    applications(
      first: 1000
      filter: { projectId: { in: $projectIds }, status: { equalTo: APPROVED } }
    ) {
      id
      projectId
      chainId
      roundId
      status
      metadataCid
      metadata
      totalDonationsCount
      totalAmountDonatedInUsd
      uniqueDonorsCount
      round {
        applicationsStartTime
        applicationsEndTime
        donationsStartTime
        donationsEndTime
        roundMetadata
        project {
          name
        }
        strategyName
      }
    }
  }
`

const legacyProjectIdsQuery = `
  query ($projectId: String!) {
    legacyProjects(first: 1, filter: { v2ProjectId: { equalTo: $projectId } }) {
      v1ProjectId
    }
  }
`

export enum CredentialsType {
    Github = 'github',
    Twitter = 'twitter',
}

export interface Round {
    donationsEndTime: string
    donationsStartTime: string
    applicationsStartTime: string
    applicationsEndTime: string
    project: {
        name: string
    }
    roundMetadata: {
        name: string
    }
    strategyName: string
}

export interface GrantApplication {
    totalAmountDonatedInUsd: number
    totalDonationsCount: number
    uniqueDonorsCount: number
    metadata: {
        application: {
            project: {
                title: string
                bannerImg: string
                website: string
                createdAt: number
                projectGithub: string
                projectTwitter: string
                userGithub: string
                description: string
            }
        }
    }
    round: Round
}

export interface GrantProject {
    name: string
    metadata: {
        title: string
        bannerImg: string
        website: string
        createdAt: number
        projectGithub: string
        projectTwitter: string
        userGithub: string
        description: string
    }
    metadataCid: string
}

export async function fetchLegacyProjectIds(id: string) {
    const legacyProjectIds = await fetchCachedJSON<{ data: { legacyProjects: Array<{ v1ProjectId: string }> } }>(
        GITCOIN_API_GRANTS_V1,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: legacyProjectIdsQuery,
                variables: {
                    projectId: id,
                },
            }),
        },
    )

    return legacyProjectIds.data.legacyProjects.map((x) => x.v1ProjectId)
}

export async function fetchProjectById(id: string) {
    if (!/0x[\dA-Fa-f]{64}/.test(id)) throw new Error('Invalid project id')
    const projects = await fetchCachedJSON<{ data: { projects: GrantProject[] } }>(GITCOIN_API_GRANTS_V1, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: projectQuery,
            variables: {
                alloVersion: 'allo-v2',
                projectId: id,
            },
        }),
    })

    return last(projects.data.projects)
}

export async function fetchApplications(id: string) {
    if (!/0x[\dA-Fa-f]{64}/.test(id)) throw new Error('Invalid project id')

    const legacyProjectIds = await fetchLegacyProjectIds(id)

    const { data } = await fetchCachedJSON<{
        data: {
            applications: GrantApplication[]
        }
    }>(GITCOIN_API_GRANTS_V1, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            operationName: 'getApprovedApplicationsByProjectIds',
            query: applicationsQuery,
            variables: {
                projectIds: [id, ...legacyProjectIds],
            },
        }),
    })

    return data
}
