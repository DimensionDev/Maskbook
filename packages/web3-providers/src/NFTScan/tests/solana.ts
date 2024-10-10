import { describe, expect, it } from 'vitest'
import { NFTScanNonFungibleTokenSolana } from '../apis/NonFungibleTokenAPI_Solana.js'

describe('NFTScan Solana', () => {
    it.skipIf(!process.env.RUN_SKIP_TESTS)(
        'should get asset correctly',
        async () => {
            const asset = await NFTScanNonFungibleTokenSolana.getAsset('9quqwD7X3ywS2QbibHGj8i95UAr6ypMDhXiv5ZmwKSvY')
            expect(asset!.traits?.sort((a, z) => a.type.charCodeAt(0) - z.type.charCodeAt(0))).toMatchSnapshot()
        },
        { retry: 3 },
    )

    it.skipIf(!process.env.RUN_SKIP_TESTS)(
        'show get assets by account correctly',
        async () => {
            const list = await NFTScanNonFungibleTokenSolana.getAssets('4Qzi1RHo3gnQ4oQrq3UccHehqA7nKo7DpMbnZUy1zpHG', {
                size: 1,
            })
            expect(list.data[0]!.traits?.sort((a, z) => a.type.charCodeAt(0) - z.type.charCodeAt(0))).toMatchSnapshot()
        },
        { retry: 3 },
    )
})
