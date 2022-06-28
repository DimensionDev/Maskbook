import { Box, CircularProgress, Link, Stack, Typography } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { LinkIcon } from '../assets/link'
import type { ChainId } from '@masknet/web3-shared-evm'
import { formatTokenId } from '../utils'
import { useI18N } from '../locales/i18n_generated'
import { ApplicationRoundIcon } from '../assets/application'
import { formatPersonaName } from '@masknet/shared-base'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useWeb3State } from '@masknet/plugin-infra/web3'

const useStyles = makeStyles()(() => ({
    root: {
        width: 160,
    },
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
                <Typography variant="body1" color="#FFB915" fontWeight={700} fontSize={12}>
                    {t.persona_verification_failed()}
                </Typography>
            ) : (
                <Box className={classes.nft}>
                    <ApplicationRoundIcon />
                    <Box sx={{ marginLeft: 0.5 }}>
                        <Typography variant="body1" color="textPrimary">
                            {formatPersonaName(nft.name.replace(/#\d+/, ''))}
                        </Typography>
                        <Stack display="flex" flexDirection="row" alignItems="center">
                            <Typography variant="body2" color="textSecondary">
                                {formatTokenId(nft.symbol, nft.tokenId)}
                            </Typography>
                            <Link
                                sx={{ marginLeft: 0.5, lineHeight: 0 }}
                                href={Others?.explorerResolver.nonFungibleTokenLink(
                                    nft.chainId,
                                    nft.address,
                                    nft.tokenId,
                                )}
                                target="_blank"
                                rel="noopener noreferrer">
                                <LinkIcon sx={{ width: 16, height: 16 }} />
                            </Link>
                        </Stack>
                    </Box>
                </Box>
            )}
        </Box>
    )
}
