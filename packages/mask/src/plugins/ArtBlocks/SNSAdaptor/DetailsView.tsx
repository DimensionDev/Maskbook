import { FormattedAddress } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import {
    formatEthereumAddress,
    formatWeiToEther,
    getChainName,
    resolveAddressLinkOnExplorer,
    useChainId,
} from '@masknet/web3-shared-evm'
import { OpenInNew } from '@mui/icons-material'
import { Typography, Box, Link } from '@mui/material'
import BigNumber from 'bignumber.js'
import { useI18N } from '../../../utils'
import { resolveLinkOnArtBlocks } from '../pipes'
import type { Project } from '../types'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            padding: theme.spacing(2),
        },
        content: {
            paddingTop: theme.spacing(0),
            paddingBottom: `${theme.spacing(0)} !important`,
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
        bold: {
            fontWeight: 'bold',
        },
        description: {
            marginTop: theme.spacing(1),
            marginBottom: theme.spacing(1),
            fontSize: 14,
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

export function DetailsView(props: DetailsViewProps) {
    const { classes } = useStyles()
    const { project } = props
    const { t } = useI18N()
    const chainId = useChainId()

    return (
        <div className={classes.root}>
            <Box className={classes.container}>
                <Typography variant="h6" sx={{ marginBottom: 1 }}>
                    {project.name}
                    <Link
                        className={classes.nameRedirectionLink}
                        href={`${resolveLinkOnArtBlocks(chainId as number)}/project/${project.projectId}`}
                        title={project.name}
                        target="_blank"
                        rel="noopener noreferrer">
                        <OpenInNew className={classes.nameRedirectionIcon} fontSize="small" />
                    </Link>
                </Typography>
                <Typography variant="body2">
                    {t('plugin_artblocks_created_by')}
                    <Link
                        href={`${resolveLinkOnArtBlocks(chainId as number)}/user/${project.artistAddress}`}
                        rel="noopener noreferrer"
                        target="_blank"
                        title={`${resolveLinkOnArtBlocks(chainId as number)}/user/${project.artistAddress}`}>
                        {` ${project.artistName}`}
                    </Link>
                    {`  •  `}
                    <Link href={project.website} rel="noopener noreferrer" target="_blank" title={project.website}>
                        {t('plugin_artblocks_website')}
                    </Link>
                </Typography>
                <Typography variant="body1" className={classes.description}>
                    {project.description}
                </Typography>
            </Box>
            <Box className={classes.container}>
                <Typography variant="body1" sx={{ marginBottom: 1 }}>
                    {t('plugin_artblocks_infos')}
                </Typography>
                <Box className={classes.meta_row}>
                    <Typography variant="body2">{t('plugin_artblocks_price_row')} </Typography>
                    <Typography variant="body2">
                        {`${formatWeiToEther(new BigNumber(project.pricePerTokenInWei))} `}
                        {project.currencyAddress === null ? 'ETH' : project.currencySymbol}
                    </Typography>
                </Box>
                <Box className={classes.meta_row}>
                    <Typography variant="body2">{t('plugin_artblocks_minted_row')} </Typography>
                    <Typography variant="body2">{`${project.invocations} of ${project.maxInvocations}`}</Typography>
                </Box>

                <Box className={classes.meta_row}>
                    <Typography variant="body2">{t('plugin_artblocks_license_row')} </Typography>
                    <Typography variant="body2">{project.license}</Typography>
                </Box>
                <Box className={classes.meta_row}>
                    <Typography variant="body2">{t('plugin_artblocks_library_row')}</Typography>
                    <Typography variant="body2">{JSON.parse(project.scriptJSON).type}</Typography>
                </Box>
            </Box>
            <Box className={classes.container}>
                <Typography variant="body1" sx={{ marginBottom: 1 }}>
                    {t('plugin_artblocks_chain')}
                </Typography>

                <Box className={classes.meta_row}>
                    <Typography variant="body2">{t('plugin_artblocks_blockchain_row')}</Typography>
                    <Typography variant="body2">{getChainName(chainId)}</Typography>
                </Box>
                <Box className={classes.meta_row}>
                    <Typography variant="body2">{t('plugin_artblocks_contract_row')}</Typography>
                    <Link
                        href={resolveAddressLinkOnExplorer(chainId, project.contract.id.toString())}
                        target="_blank"
                        rel="noopener noreferrer">
                        <Typography variant="body2">
                            <FormattedAddress
                                address={project.contract.id.toString()}
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
