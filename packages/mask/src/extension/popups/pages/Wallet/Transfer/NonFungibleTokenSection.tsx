import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { useNonFungibleAssets } from '@masknet/web3-hooks-base'
import { Box } from '@mui/material'
import { memo } from 'react'
import { useTokenParams } from '../../../hook/useTokenParams.js'

const useStyles = makeStyles()((theme) => {
    return {
        list: {},
    }
})
export const NonFungibleTokenSection = memo(function NonFungibleTokenSection() {
    const { classes } = useStyles()
    const { chainId, address, params, setParams } = useTokenParams()

    const {
        value: fetchedTokens = EMPTY_LIST,
        done,
        next,
        loading,
        error: loadError,
    } = useNonFungibleAssets(NetworkPluginID.PLUGIN_EVM, undefined, { chainId })
    return (
        <Box className={classes.list}>
            {fetchedTokens.map((token) => {
                return <div key={token.id}>{token.metadata?.name}</div>
            })}
        </Box>
    )
})
