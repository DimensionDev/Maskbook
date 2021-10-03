export const FoundationAddressIdQuery = (tokenId: string) => `
query {
    nfts(where: {tokenId: ${tokenId} })
        {
        id
        creator{
            id
        }
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
            tokenAddress
            date
            txOrigin {
            id
            }
        }
        nftContract{
            baseURI
        }
        tokenIPFSPath
        }
  }`
