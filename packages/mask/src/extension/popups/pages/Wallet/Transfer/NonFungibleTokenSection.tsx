import { CollectibleList, ElementAnchor } from '@masknet/shared'
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import { LoadingBase, makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useNonFungibleAssets } from '@masknet/web3-hooks-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { isLensCollect, isLensFollower, isLensProfileAddress } from '@masknet/web3-shared-evm'
import { Box } from '@mui/material'
import { uniqWith } from 'lodash-es'
import { memo, useCallback, useMemo } from 'react'
import { useNonFungibleTokenParams } from '../../../hook/index.js'

const useStyles = makeStyles()((theme) => {
    return {
        section: {},
        collectibleList: {
            padding: 0,
        },
    }
})

const getCollectibleKey = (token: Web3Helper.NonFungibleAssetAll) => {
    return `${token.chainId}.${token.address}.${token.tokenId}`
}
export const NonFungibleTokenSection = memo(function NonFungibleTokenSection() {
    const { classes } = useStyles()
    const { chainId, address, tokenId, setParams } = useNonFungibleTokenParams()

    const { value: fetchedTokens = EMPTY_LIST, done, next, loading } = useNonFungibleAssets(NetworkPluginID.PLUGIN_EVM)
    const tokens = useMemo(() => {
        const filtered = fetchedTokens.filter((x) => {
            if (isLensProfileAddress(x.address)) return false
            if (x.metadata?.name && isLensFollower(x.metadata.name)) return false
            if (x.collection?.name && isLensCollect(x.collection.name)) return false
            return true
        })
        return uniqWith(filtered, (v1, v2) => {
            return isSameAddress(v1.contract?.address, v2.contract?.address) && v1.tokenId === v2.tokenId
        })
    }, [fetchedTokens])

    const selectedKey = address && tokenId ? `${chainId}.${address}.${tokenId}` : undefined

    const handleChange = useCallback((value: string | null) => {
        setParams(
            (p) => {
                if (!value) {
                    p.delete('nft:chainId')
                    p.delete('nft:address')
                    p.delete('nft:tokenId')
                    return p.toString()
                }
                const [chainId, address, tokenId] = value.split('.')
                p.set('nft:chainId', chainId)
                p.set('nft:address', address)
                p.set('nft:tokenId', tokenId)
                return p.toString()
            },
            { replace: true },
        )
    }, [])

    return (
        <Box className={classes.section}>
            <CollectibleList
                classes={{ root: classes.collectibleList }}
                retry={next}
                collectibles={tokens}
                pluginID={NetworkPluginID.PLUGIN_EVM}
                loading={loading}
                columns={4}
                gap={1}
                selectable
                value={selectedKey}
                showNetworkIcon
                getCollectibleKey={getCollectibleKey}
                onChange={handleChange}
            />
            <ElementAnchor key={fetchedTokens.length} callback={() => next?.()}>
                {!done && <LoadingBase size={36} />}
            </ElementAnchor>
        </Box>
    )
})
