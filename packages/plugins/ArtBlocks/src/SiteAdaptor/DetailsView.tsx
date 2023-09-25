import { FormattedAddress } from '@masknet/shared'
import { BigNumber } from 'bignumber.js'
import { OpenInNew } from '@mui/icons-material'
import { Typography, Box, Link } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { formatEthereumAddress, formatWeiToEther } from '@masknet/web3-shared-evm'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { ChainResolver, ExplorerResolver } from '@masknet/web3-providers'
import { resolveProjectLinkOnArtBlocks, resolveUserLinkOnArtBlocks } from '../pipes/index.js'
import type { Project } from '../types.js'
import { useArtBlocksI18N } from '../locales/index.js'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            padding: theme.spacing(2),
        },
        container: {
            padding: theme.spacing(1),
        },
        nameRedirectionIcon: {
            verticalAlign: 'text-bottom',
        },
        nameRedirectionLink: {
            marginLeft: theme.spacing(0.5),
        },
        description: {
            marginTop: theme.spacing(1),
            marginBottom: theme.spacing(1),
            whiteSpace: 'pre-line',
        },
        meta_row: {
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: theme.spacing(0.5),
            '&:last-child': {
                marginBottom: theme.spacing(0),
            },
        },
    }
})

interface DetailsViewProps {
    project: Project
}

export function DetailsView({ project }: DetailsViewProps) {
    const { classes } = useStyles()
    const t = useArtBlocksI18N()
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    const invocations = `${project.invocations} of ${project.maxInvocations}`
    const price = `${formatWeiToEther(new BigNumber(project.pricePerTokenInWei))} `

    return (
        <div className={classes.root}>
            <Box className={classes.container}>
                <Typography variant="h6" sx={{ marginBottom: 1 }}>
                    {project.name}
                    <Link
                        className={classes.nameRedirectionLink}
                        href={resolveProjectLinkOnArtBlocks(chainId, project.projectId)}
                        title={project.name}
                        target="_blank"
                        rel="noopener noreferrer">
                        <OpenInNew className={classes.nameRedirectionIcon} fontSize="small" />
                    </Link>
                </Typography>
                <Typography variant="body2">
                    {t.plugin_artblocks_created_by()}
                    <Link
                        href={resolveUserLinkOnArtBlocks(chainId, project.artistAddress)}
                        rel="noopener noreferrer"
                        target="_blank"
                        title={resolveUserLinkOnArtBlocks(chainId, project.artistAddress)}>
                        {` ${project.artistName}`}
                    </Link>
                    &nbsp;&bull;&nbsp;
                    <Link href={project.website} rel="noopener noreferrer" target="_blank" title={project.website}>
                        {t.plugin_artblocks_website()}
                    </Link>
                </Typography>
                <Typography variant="body1" className={classes.description}>
                    {project.description}
                </Typography>
            </Box>
            <Box className={classes.container}>
                <Typography variant="body1" sx={{ marginBottom: 1 }}>
                    {t.plugin_artblocks_infos()}
                </Typography>
                <Box className={classes.meta_row}>
                    <Typography variant="body2">{t.plugin_artblocks_price_row()} </Typography>
                    <Typography variant="body2">
                        {price}
                        {project.currencySymbol === null ? 'ETH' : project.currencySymbol}
                    </Typography>
                </Box>
                <Box className={classes.meta_row}>
                    <Typography variant="body2">{t.plugin_artblocks_minted_row()} </Typography>
                    <Typography variant="body2">{invocations}</Typography>
                </Box>

                <Box className={classes.meta_row}>
                    <Typography variant="body2">{t.plugin_artblocks_license_row()} </Typography>
                    <Typography variant="body2">{project.license}</Typography>
                </Box>
                {project.scriptJSON ? (
                    <Box className={classes.meta_row}>
                        <Typography variant="body2">{t.plugin_artblocks_library_row()}</Typography>
                        <Typography variant="body2">{JSON.parse(project.scriptJSON).type}</Typography>
                    </Box>
                ) : null}
            </Box>
            <Box className={classes.container}>
                <Typography variant="body1" sx={{ marginBottom: 1 }}>
                    {t.plugin_artblocks_chain()}
                </Typography>

                <Box className={classes.meta_row}>
                    <Typography variant="body2">{t.plugin_artblocks_blockchain_row()}</Typography>
                    <Typography variant="body2">{ChainResolver.chainName(chainId)}</Typography>
                </Box>
                <Box className={classes.meta_row}>
                    <Typography variant="body2">{t.plugin_artblocks_contract_row()}</Typography>
                    <Link
                        href={ExplorerResolver.transactionLink(chainId, project.contract.id)}
                        target="_blank"
                        rel="noopener noreferrer">
                        <Typography variant="body2">
                            <FormattedAddress
                                address={project.contract.id}
                                size={4}
                                formatter={formatEthereumAddress}
                            />
                        </Typography>
                    </Link>
                </Box>
            </Box>
        </div>
    )
}
