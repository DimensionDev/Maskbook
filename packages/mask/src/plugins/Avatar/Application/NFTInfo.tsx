import { Box, CircularProgress, Typography } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useI18N } from '../locales/i18n_generated'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useWeb3State } from '@masknet/plugin-infra/web3'

const useStyles = makeStyles()(() => ({
    root: {},
    nft: {
        display: 'flex',
        alignItems: 'center',
    },
}))
interface NFTInfoProps extends withClasses<'root'> {
    nft?: {
        name: string
        address: string
        tokenId: string
        symbol: string
        chainId: ChainId
        networkPluginID: NetworkPluginID
    }
    owner: boolean
    loading?: boolean
}

export function NFTInfo(props: NFTInfoProps) {
    const { nft, owner, loading = false } = props
    const classes = useStylesExtends(useStyles(), props)
    const t = useI18N()
    const { Others } = useWeb3State<'all'>(nft?.networkPluginID ?? NetworkPluginID.PLUGIN_EVM)

    if (loading) return <CircularProgress size={24} />
    return (
        <Box className={classes.root}>
            {!nft ? (
                <Typography fontWeight={700} fontSize={12}>
                    {t.persona_set_nft()}
                </Typography>
            ) : !owner ? (
                <Typography variant="body1" fontWeight={700} fontSize={12}>
                    {t.persona_set_nft()}
                </Typography>
            ) : (
                <Typography variant="body1" fontWeight={700} fontSize={12}>
                    {t.persona_nft_setted()}
                </Typography>
            )}
        </Box>
    )
}
