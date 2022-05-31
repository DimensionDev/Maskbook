import { useState } from 'react'
import { Tab, Tabs, Paper, Card, CardHeader, CardContent, Link, Typography, Avatar, Box } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useChainId } from '@masknet/plugin-infra/web3'
import { useI18N } from '../../../utils'
import { CollectionView } from './CollectionView'
import { DetailsView } from './DetailsView'
import { ChainId, formatWeiToEther } from '@masknet/web3-shared-evm'
import { useFetchProject } from '../hooks/useProject'
import { ActionBar } from './ActionBar'
import { resolveProjectLinkOnArtBlocks, resolveUserLinkOnArtBlocks } from '../pipes'
import { ArtBlocksLogoUrl } from '../constants'
import { ChainBoundary } from '../../../web3/UI/ChainBoundary'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            width: '100%',
            border: `solid 1px ${theme.palette.divider}`,
            padding: 0,
        },
        tab: {
            height: 'var(--tabHeight)',
            minHeight: 0,
            borderTop: `solid 1px ${theme.palette.divider}`,
            borderBottom: `solid 1px ${theme.palette.divider}`,
        },
        content: {
            padding: '0 !important',
        },
        footer: {
            marginTop: -1, // merge duplicate borders
            zIndex: 1,
            position: 'relative',
            borderTop: `solid 1px ${theme.palette.divider}`,
            justifyContent: 'space-between',
        },
        footnote: {
            fontSize: 10,
            marginRight: theme.spacing(1),
        },
        footLink: {
            cursor: 'pointer',
            marginRight: theme.spacing(0.5),
            '&:last-child': {
                marginRight: 0,
            },
        },
        mask: {
            width: 40,
            height: 10,
        },
    }
})

interface CollectibleProps {
    projectId: string
    chainId?: ChainId
}

export function Collectible(props: CollectibleProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const default_chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const chainId = props?.chainId ?? default_chainId
    const [tabIndex, setTabIndex] = useState(0)

    const { value, loading, error } = useFetchProject(props.projectId, chainId)
    const project = value?.projects[0]

    if (loading) return <Typography align="center">{t('loading')}</Typography>

    if (error || !project)
        return (
            <Typography align="center" color="textPrimary">
                {t('plugin_artblocks_smt_wrong')}
            </Typography>
        )

    const tabs = [
        <Tab className={classes.tab} key="collection" label={t('plugin_artblocks_collection')} />,
        <Tab className={classes.tab} key="details" label={t('plugin_artblocks_details')} />,
    ]
    const pages = [<CollectionView key="project" project={project} />, <DetailsView key="details" project={project} />]

    const invocations = ` ${project.invocations} of ${project.maxInvocations} minted `
    const price = ` ${formatWeiToEther(project.pricePerTokenInWei)} ${project?.currencySymbol}`

    return (
        <>
            <Card className={classes.root}>
                <CardHeader
                    avatar={<Avatar src={ArtBlocksLogoUrl} />}
                    title={
                        <Typography>
                            <Link
                                href={resolveProjectLinkOnArtBlocks(chainId, project.projectId)}
                                title={project.name}
                                target="_blank"
                                rel="noopener noreferrer">
                                {project.name}
                            </Link>
                        </Typography>
                    }
                    subheader={
                        <Typography>
                            <Link
                                href={resolveUserLinkOnArtBlocks(chainId, project.artistAddress)}
                                title={project.artistAddress}
                                target="_blank"
                                rel="noopener noreferrer">
                                {project.artistName}
                            </Link>{' '}
                            &bull;{invocations}
                            &bull;{price}
                        </Typography>
                    }
                />
                <CardContent className={classes.content}>
                    <Tabs
                        indicatorColor="primary"
                        textColor="primary"
                        variant="fullWidth"
                        value={tabIndex}
                        onChange={(ev: React.ChangeEvent<{}>, newValue: number) => setTabIndex(newValue)}
                        TabIndicatorProps={{
                            style: {
                                display: 'none',
                            },
                        }}>
                        {tabs}
                    </Tabs>
                    <Paper>{pages[tabIndex]}</Paper>
                </CardContent>
            </Card>
            <Box sx={{ flex: 1, display: 'flex', padding: 1.5 }}>
                <ChainBoundary expectedPluginID={NetworkPluginID.PLUGIN_EVM} expectedChainId={chainId} renderInTimeline>
                    <ActionBar chainId={chainId} project={project} />
                </ChainBoundary>
            </Box>
        </>
    )
}
