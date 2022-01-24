import { useI18N } from '../../../utils'
import { Tab, Tabs, Paper, Card, CardHeader, CardContent, CardActions, Link, Typography, Avatar } from '@mui/material'
import { useState } from 'react'
import { makeStyles } from '@masknet/theme'
import { CollectionView } from './CollectionView'
import { DetailsView } from './DetailsView'
import { formatWeiToEther, useChainId } from '@masknet/web3-shared-evm'
import { useFetchProject } from '../hooks/useProject'
import { ActionBar } from './ActionBar'
import { resolveProjectLinkOnArtBlocks, resolveUserLinkOnArtBlocks } from '../pipes'
import { ArtBlocksLogoUrl } from '../constants'
import { MaskTextIcon } from '../../../resources/MaskIcon'

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
            padding: 0,
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
}

export function Collectible(props: CollectibleProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const chainId = useChainId()
    const [tabIndex, setTabIndex] = useState(0)

    const { value, loading, error } = useFetchProject(props.projectId)
    const project = value?.projects[0]

    if (loading) return <Typography align="center">{t('loading')}</Typography>

    if (error || !value)
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
                <CardActions className={classes.footer}>
                    <Typography className={classes.footnote} variant="subtitle2">
                        <span>{t('plugin_powered_by')} </span>
                        <Link
                            className={classes.footLink}
                            color="textSecondary"
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Mask"
                            href="https://mask.io">
                            <MaskTextIcon classes={{ root: classes.mask }} viewBox="0 0 80 20" />
                        </Link>
                    </Typography>
                </CardActions>
            </Card>
            <ActionBar project={project} />
        </>
    )
}
