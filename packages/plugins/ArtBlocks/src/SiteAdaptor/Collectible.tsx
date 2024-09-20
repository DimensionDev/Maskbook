import { useState } from 'react'
import { Tab, Tabs, Paper, Card, CardHeader, CardContent, Link, Typography, Avatar, Box } from '@mui/material'
import { LoadingBase, makeStyles } from '@masknet/theme'
import { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext } from '@masknet/web3-hooks-base'
import { CollectionView } from './CollectionView.js'
import { DetailsView } from './DetailsView.js'
import { type ChainId, formatWeiToEther } from '@masknet/web3-shared-evm'
import { useFetchProject } from '../hooks/useProject.js'
import { ActionBar } from './ActionBar.js'
import { resolveProjectLinkOnArtBlocks, resolveUserLinkOnArtBlocks } from '../pipes/index.js'
import { ArtBlocksLogoUrl } from '../constants.js'
import { ChainBoundary } from '@masknet/shared'
import { Trans } from '@lingui/macro'

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
        body: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minHeight: 300,
            justifyContent: 'center',
        },
    }
})

interface CollectibleProps {
    projectId: string
    chainId?: ChainId
}

export function Collectible({ projectId, chainId: projectChainId }: CollectibleProps) {
    const { classes } = useStyles()
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>({ chainId: projectChainId })
    const [tabIndex, setTabIndex] = useState(0)

    const { value, loading, error } = useFetchProject(projectId, chainId)
    const project = value?.projects[0]

    if (loading)
        return (
            <div className={classes.body}>
                <LoadingBase />
            </div>
        )

    if (error || !project)
        return (
            <Typography align="center" color="textPrimary">
                <Trans>Something went wrong!</Trans>
            </Typography>
        )

    const tabs = [
        <Tab className={classes.tab} key="collection" label={<Trans>Collection</Trans>} />,
        <Tab className={classes.tab} key="details" label={<Trans>Details</Trans>} />,
    ]
    const pages = [<CollectionView key="project" project={project} />, <DetailsView key="details" project={project} />]

    const invocations = ` ${project.invocations} of ${project.maxInvocations} minted `
    const price =
        formatWeiToEther(project.pricePerTokenInWei).isZero() ?
            ''
        :   ` ${formatWeiToEther(project.pricePerTokenInWei)} ${project?.currencySymbol}`

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
                        onChange={(ev, newValue: number) => setTabIndex(newValue)}
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
            {price ?
                <Box sx={{ flex: 1, display: 'flex', padding: 1.5 }}>
                    <ChainBoundary
                        expectedPluginID={NetworkPluginID.PLUGIN_EVM}
                        expectedChainId={chainId}
                        ActionButtonPromiseProps={{ variant: 'roundedDark' }}>
                        <ActionBar chainId={chainId} project={project} />
                    </ChainBoundary>
                </Box>
            :   null}
        </>
    )
}
