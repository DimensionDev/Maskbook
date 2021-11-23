import type { Web3Plugin, Pagination } from '@masknet/plugin-infra/src'
import { ChainId, createClient, getTopShotConstants } from '@masknet/web3-shared-flow'

async function getAssetTopShot(chainId: ChainId, account: string) {
    const { TOP_SHOT_ADDRESS = '', NON_FUNGIBLE_TOKEN_ADDRESS = '' } = getTopShotConstants(chainId)
    const sdk = createClient(chainId)
    return sdk.query({
        cadence: `
            import TopShot from ${TOP_SHOT_ADDRESS}

            pub fun main(address: Address): [UInt64] {
                if let collection = getAccount(address).getCapability(/public/MomentCollection).borrow<&{TopShot.MomentCollectionPublic}>() {
                    return collection.getIDs()
                }
                return []
            }
        `,
        args: (arg, t) => [arg(account, t.Address)],
    })
}

async function getMoment(chainId: ChainId, account :string, id: string) {
    const { TOP_SHOT_ADDRESS = '', NON_FUNGIBLE_TOKEN_ADDRESS = '' } = getTopShotConstants(chainId)
    const sdk = createClient(chainId)
    return sdk.query({
        cadence: `
            import NonFungibleToken from ${NON_FUNGIBLE_TOKEN_ADDRESS}
            import TopShot from ${TOP_SHOT_ADDRESS}

            pub struct MomentItem {
                pub let playID: UInt64
                pub let setID: UInt64

                init(playID: UInt64, setID: UInt64) {
                    self.playID = playID
                    self.setID = setID
                }
            }

            pub fun fetch(address: Address, id: UInt64): MomentItem? {
                if let col = getAccount(address).getCapability(/public/MomentCollection).borrow<&{TopShot.MomentCollectionPublic}>() {
                    if let moment = col.borrowMoment(id: id) {
                      return MomentItem(playID: moment.playID, setID: moment.setID)
                    }
                  }
                  return nil
            }

            pub fun main(ids: [UInt64]): { String: MomentItem? } {
                let result: { String: MomentItem? } = {}
                var i = 0
                while i < ids.length {
                    let id = ids[i]
                    let address = ${account}
                    result[id] = fetch(address: ${account}, id: id)
                    i = i + 1
                }
                return result
            }
        `,
        args: (arg, t) => [arg(account, t.Address)],
    })
}

async function getAllPlays(chainId: ChainId) {
    const { TOP_SHOT_ADDRESS = '', NON_FUNGIBLE_TOKEN_ADDRESS = '' } = getTopShotConstants(chainId)
    const sdk = createClient(chainId)

    return sdk.query({
        cadence: `
            import TopShot from ${TOP_SHOT_ADDRESS}

            pub fun main(): [TopShot.Play] {
                return TopShot.getAllPlays()
            }
        `,
        args: () => []
    })

}

async function getMetadata(chainId: ChainId, account: string, id: number) {
    const { TOP_SHOT_ADDRESS = '', NON_FUNGIBLE_TOKEN_ADDRESS = '' } = getTopShotConstants(chainId)
    const sdk = createClient(chainId)
    return sdk.query({
        cadence: `
            import TopShot from ${TOP_SHOT_ADDRESS}

            // This script gets the metadata associated with a moment
            // in a collection by looking up its playID and then searching
            // for that play's metadata in the TopShot contract

            // Parameters:
            //
            // account: The Flow Address of the account whose moment data needs to be read
            // id: The unique ID for the moment whose data needs to be read

            // Returns: {String: String}
            // A dictionary of all the play metadata associated
            // with the specified moment

            pub fun main(account: Address, id: UInt64): {String: String} {

                // get the public capability for the owner's moment collection
                // and borrow a reference to it
                let collectionRef = getAccount(account).getCapability(/public/MomentCollection)
                    .borrow<&{TopShot.MomentCollectionPublic}>()
                    ?? panic("Could not get public moment collection reference")

                // Borrow a reference to the specified moment
                let token = collectionRef.borrowMoment(id: id)
                    ?? panic("Could not borrow a reference to the specified moment")

                // Get the moment's metadata to access its play and Set IDs
                let data = token.data

                // Use the moment's play ID
                // to get all the metadata associated with that play
                let metadata = TopShot.getPlayMetaData(playID: data.playID) ?? panic("Play doesn't exist")

                log(metadata)

                return metadata
            }
        `,
        args: (arg, t) => [arg(account, t.Address), arg(id, t.UInt64)],
    })
}

async function getSerialNum(chainId: ChainId, account: string, id: number) {
    const { TOP_SHOT_ADDRESS = '', NON_FUNGIBLE_TOKEN_ADDRESS = '' } = getTopShotConstants(chainId)
    const sdk = createClient(chainId)
    return sdk.query({
        cadence: `
            import TopShot from ${TOP_SHOT_ADDRESS}

            // This script gets the serial number of a moment
            // by borrowing a reference to the moment
            // and returning its serial number

            // Parameters:
            //
            // account: The Flow Address of the account whose moment data needs to be read
            // id: The unique ID for the moment whose data needs to be read

            // Returns: UInt32
            // The serialNumber associated with a moment with a specified ID

            pub fun main(account: Address, id: UInt64): UInt32 {

                let collectionRef = getAccount(account).getCapability(/public/MomentCollection)
                    .borrow<&{TopShot.MomentCollectionPublic}>()
                    ?? panic("Could not get public moment collection reference")

                let token = collectionRef.borrowMoment(id: id)
                    ?? panic("Could not borrow a reference to the specified moment")

                let data = token.data

                return data.serialNumber
            }
        `,
        args: (arg, t) => [arg(account, t.Address), arg(id, t.UInt64)],
    })
}

async function getPlayID(chainId: ChainId, account: string, id: number) {
    const { TOP_SHOT_ADDRESS = '', NON_FUNGIBLE_TOKEN_ADDRESS = '' } = getTopShotConstants(chainId)
    const sdk = createClient(chainId)
    return sdk.query({
        cadence: `
            import TopShot from ${TOP_SHOT_ADDRESS}

            // This script gets the playID associated with a moment
            // in a collection by getting a reference to the moment
            // and then looking up its playID

            // Parameters:
            //
            // account: The Flow Address of the account whose moment data needs to be read
            // id: The unique ID for the moment whose data needs to be read

            // Returns: UInt32
            // The playID associated with a moment with a specified ID

            pub fun main(account: Address, id: UInt64): UInt32 {

                let collectionRef = getAccount(account).getCapability(/public/MomentCollection)
                    .borrow<&{TopShot.MomentCollectionPublic}>()
                    ?? panic("Could not get public moment collection reference")

                let token = collectionRef.borrowMoment(id: id)
                    ?? panic("Could not borrow a reference to the specified moment")

                let data = token.data

                return data.playID
            }
        `,
        args: (arg, t) => [arg(account, t.Address), arg(id, t.UInt64)],
    })
}




export async function getNonFungibleAssets(
    address: string,
    providerType: string,
    network: Web3Plugin.NetworkDescriptor,
    pagination?: Pagination,
): Promise<Web3Plugin.Asset[]> {
    console.log('DEBUG: getNonFungibleAssets')
    try {
        const ids = await getAssetTopShot(network.chainId, '0xb269e48ed57209af')
        const playIDs = await Promise.allSettled(ids.map((id: number) => getPlayID(network.chainId, '0xb269e48ed57209af', id)))
        const metadatas = await Promise.allSettled(ids.map((id: number) => getMetadata(network.chainId, '0xb269e48ed57209af', id)))
        const serialNums = await Promise.allSettled(ids.map((id: number) => getSerialNum(network.chainId, '0xb269e48ed57209af', id)))
        console.log(
            ids,
            playIDs,
            metadatas,
            serialNums,
        )
        return []
    } catch (error) {
        console.log(error)
    }

    return []
}
