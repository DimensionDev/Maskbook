import { MediaImageFragment, UsernameFragment, graphql } from '@lens-protocol/client'

export const AccountMetadataFragment = graphql(
    `
        fragment AccountMetadata on AccountMetadata {
            name
            bio
            thumbnail: picture(request: { preferTransform: { fixedSize: { height: 128, width: 128 } } })
            picture
        }
    `,
    [MediaImageFragment],
)

export const AccountFragment = graphql(
    `
        fragment Account on Account {
            __typename
            username {
                ...Username
            }
            address
            metadata {
                ...AccountMetadata
            }
        }
    `,
    [UsernameFragment, AccountMetadataFragment],
)
