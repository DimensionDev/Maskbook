export const ShoyuNFTContractsQuery = `
    query NFTContractsQuery($nftContractsOwner: Address) {
        nftContracts(owner: $nftContractsOwner) {
        id
        chainId
        address
        standard
        owner
        name
        symbol
        royaltyFeeRecipient
        royaltyFee
        txHash
        confirmed
        }
    }
`

export const ShoyuUserQuery = `
    query UserQuery($userAddress: Address!) {
    user(address: $userAddress) {
        id
        chainId
        address
        username
        name
        email
        bio
        profilePicture
        website
        discord
        telegram
        twitter
        facebook
        instagram
        tiktok
        youtube
        twitch
    }
}
`

export const ShoyuNFTsQuery = `
    query NFTsQuery(
        $nftsContract: Address
        $nftsTokenId: Uint256
        $nftsParked: Boolean
        $nftsOwner: Address
        $nftsLimit: Int
        $nftsOffset: Int
    ) {
        nfts(
        contract: $nftsContract
        tokenId: $nftsTokenId
        parked: $nftsParked
        owner: $nftsOwner
        limit: $nftsLimit
        offset: $nftsOffset
        ) {
        id
        contract {
            id
            chainId
            address
            standard
            owner
            name
            symbol
            royaltyFeeRecipient
            royaltyFee
            txHash
            confirmed
        }
        tokenId
        parked
        name
        description
        image
        owners {
            owner
            balance
        }
        }
    }
`

export const ShoyuMeQuery = `
    query MeQuery {
    me {
        id
        chainId
        address
        name
        username
        email
        bio
        profilePicture
        website
        discord
        telegram
        twitter
        facebook
        instagram
        tiktok
        youtube
        twitch
    }
    }
`

// Mutations

export const ShoyuUpdateNFTMutation = `
mutation Mutation($updateNfTsInput: UpdateNFTsInput!) {
    updateNFTs(input: $updateNfTsInput) {
      id
      contract {
        id
        chainId
        address
        standard
        owner
        name
        symbol
        royaltyFeeRecipient
        royaltyFee
        txHash
        confirmed
      }
      tokenId
      parked
      name
      description
      image
      owners {
        owner
        balance
      }
    }
  }
`

export const ShoyuSignUpMutation = `
    mutation Mutation($signUpInput: UserInput!) {
        signUp(input: $signUpInput) {
        id
        chainId
        address
        username
        name
        email
        bio
        profilePicture
        website
        discord
        telegram
        twitter
        facebook
        instagram
        tiktok
        youtube
        twitch
        }
    }
`

export const ShoyuUpdateMeMutation = `
mutation Mutation($updateMeInput: UserInput!) {
    updateMe(input: $updateMeInput) {
      id
      chainId
      address
      username
      name
      email
      bio
      profilePicture
      website
      discord
      telegram
      twitter
      facebook
      instagram
      tiktok
      youtube
      twitch
    }
  }
`

export const ShoyuSyncMutation = `
  mutation Mutation {
    sync {
      chainId
    }
  }
`

export const ShoyuDeployNFTContractMutation = `
    mutation Mutation($deployNftContractInput: DeployNFTContractInput!) {
        deployNFTContract(input: $deployNftContractInput) {
            id
            chainId
            address
            standard
            owner
            name
            symbol
            royaltyFeeRecipient
            royaltyFee
            txHash
            confirmed
        }
    }
`
