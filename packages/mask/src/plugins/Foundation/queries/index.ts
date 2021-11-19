export const FoundationAddressIdQuery = (tokenId: string) => `
query {
    nfts(where: {tokenId: ${tokenId} })
        {
        id
        auctions{
            id
            dateEnding
          }
        mostRecentAuction {
            id
            reservePriceInETH
            dateEnding
            status
            highestBid {
                bidder {
                  id
                }
              amountInETH
              }
        }
        nftHistory{
            event
            id
            contractAddress
            amountInETH
            date
            txOrigin {
            id
            }
        }
        nftContract{
            id
            baseURI
        }
        tokenIPFSPath
        tokenId
        }
  }`
