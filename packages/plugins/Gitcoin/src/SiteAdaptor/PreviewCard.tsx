import { LoadingStatus, Markdown, ReloadStatus } from '@masknet/shared'
import { ActionButton, makeStyles, MaskTabList, useTabs } from '@masknet/theme'

import { useProject } from './hooks/useProject.js'
import { Box, Link, Tab, Typography } from '@mui/material'
import { getIPFSImageUrl } from './utils/getIPFSImageUrl.js'
import { Icons } from '@masknet/icons'
import { format, isBefore } from 'date-fns'
import { TabContext, TabPanel } from '@mui/lab'
import type { Round } from '../apis/index.js'
import { openWindow } from '@masknet/shared-base-ui'
import { DEFAULT_PROJECT_BANNER } from '../constants.js'
import { Trans } from '@lingui/macro'
const useStyles = makeStyles()((theme) => ({
    card: {
        padding: theme.spacing(0, 1.5, 1.5),
        display: 'flex',
        flexDirection: 'column',
    },
    title: {
        color: theme.palette.maskColor.main,
        fontSize: 24,
        fontWeight: 700,
        lineHeight: '120%',
    },
    button: {
        height: '34px',
    },
    banner: {
        borderRadius: 8,
        margin: theme.spacing(1, 0),
    },
    links: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        rowGap: 12,
        columnGap: 16,
    },
    linkItem: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        color: theme.palette.maskColor.main,
    },
    link: {
        color: theme.palette.maskColor.main,
    },
    stats: {
        margin: theme.spacing(1.5, 0),
        padding: theme.spacing(1.5),
        display: 'flex',
        gap: 12,
        background: theme.palette.maskColor.white,
        borderRadius: 8,
        justifyContent: 'space-between',
    },
    statsItem: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
    },
    statsValue: {
        fontSize: 24,
        fontWeight: 700,
        lineHeight: '120%',
        color: theme.palette.maskColor.main,
    },
    statsTitle: {
        color: theme.palette.maskColor.second,
        fontSize: 14,
        lineHeight: '18px',
    },
    subtitle: {
        fontSize: 18,
        fontWeight: 700,
        lineHeight: '22px',
        color: theme.palette.maskColor.main,
    },
    rounds: {
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
    },
    round: {
        borderRadius: 12,
        background: theme.palette.maskColor.bg,
        padding: theme.spacing(1.5),
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
    },
    roundName: {
        fontSize: 14,
        lineHeight: '18px',
        color: theme.palette.maskColor.main,
    },
    roundStatus: {
        padding: theme.spacing(0.75, 1.5),
        borderRadius: 8,
        color: theme.palette.maskColor.main,
        fontSize: 14,
        lineHeight: '18px',
    },
    markdown: {
        color: 'inherit',
        fontSize: 'inherit',
        fontFamily: 'sans-serif',
        '& p, & li': {
            margin: 0,
            fontSize: 12,
            color: theme.palette.maskColor.main,
        },
        '& p + p': {
            marginTop: theme.spacing(0.5),
        },
        '& h1, & h2, & h3, & h4, & h5, & h6': {
            fontSize: 14,
            fontWeight: 500,
            color: theme.palette.maskColor.main,
        },
        '& img': {
            maxWidth: '100%',
        },
        '& a': {
            color: theme.palette.maskColor.main,
        },
    },
    placeholder: {
        minHeight: 326,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderTitle: {
        textAlign: 'center',
        color: theme.palette.maskColor.main,
    },
    tabContent: {
        paddingTop: 16,
        background: theme.palette.maskColor.white,
        borderRadius: '0 0 12px 12px',
    },
    panel: {
        maxHeight: 326,
        overflow: 'auto',
        paddingTop: 0,
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
}))

interface PreviewCardProps {
    grantId: string
    link: string
}

export function PreviewCard(props: PreviewCardProps) {
    const { classes } = useStyles()
    const { value: data, loading, error, retry: refetch } = useProject(props.grantId)

    const [currentTab, onChange, tabs] = useTabs('detail', 'pastRounds')

    if (loading)
        return (
            <article className={classes.card} data-hide-scrollbar>
                <LoadingStatus height={148} p={1} />
            </article>
        )
    if (error)
        return (
            <article className={classes.card} data-hide-scrollbar>
                <ReloadStatus height={120} message={<Trans>Something went wrong.</Trans>} onRetry={refetch} />
            </article>
        )

    const { project, applications } = data || {}

    if (!project || !applications) return

    const links = [
        {
            icon: <Icons.Global size={16} />,
            url: project.metadata.website,
        },
        {
            icon: <Icons.TwitterXRound size={16} variant="light" />,
            url: project.metadata.projectTwitter,
        },
        {
            icon: <Icons.GithubDark size={16} />,
            url: project.metadata.projectGithub,
        },
        {
            icon: <Icons.GithubDark size={16} />,
            url: project.metadata.userGithub,
        },
    ].filter((x) => !!x.url)

    const totalFundingReceived = applications.applications
        .reduce((acc, application) => {
            return acc + application.totalAmountDonatedInUsd
        }, 0)
        .toFixed()

    const totalContributions = applications.applications
        .reduce((acc, application) => {
            return acc + application.totalDonationsCount
        }, 0)
        .toFixed()

    const totalUniqueDonors = applications.applications
        .reduce((acc, application) => {
            return acc + application.uniqueDonorsCount
        }, 0)
        .toFixed()

    const totalRoundsParticipated = applications.applications.length

    const stats = [
        {
            title: <Trans>funding received</Trans>,
            value: `$${totalFundingReceived}`,
        },
        {
            title: <Trans>contributions</Trans>,
            value: totalContributions,
        },
        {
            title: <Trans>unique contributors</Trans>,
            value: totalUniqueDonors,
        },
        {
            title: <Trans>rounds</Trans>,
            value: totalRoundsParticipated,
        },
    ]

    const pastRounds = applications.applications.filter((x) => isBefore(x.round.donationsEndTime, new Date()))

    return (
        <article className={classes.card} data-hide-scrollbar>
            <Box display="flex" gap={1.5} justifyContent="space-between" alignItems="center">
                <Typography component="h1" className={classes.title}>
                    {project.metadata.title}
                </Typography>
                <ActionButton
                    component="a"
                    onClick={() => {
                        openWindow(props.link, '_blank', { referrer: false })
                    }}
                    size="small"
                    variant="roundedContained"
                    className={classes.button}>
                    <Trans>View</Trans>
                </ActionButton>
            </Box>

            <img
                src={
                    project.metadata.bannerImg ?
                        getIPFSImageUrl(project.metadata.bannerImg, 190)
                    :   DEFAULT_PROJECT_BANNER
                }
                className={classes.banner}
            />

            <Box className={classes.links}>
                {links.map((x, index) => (
                    <Typography className={classes.linkItem} key={index}>
                        {x.icon}
                        <Link className={classes.link} underline="none" href={x.url}>
                            {x.url}
                        </Link>
                    </Typography>
                ))}
                <Box className={classes.linkItem} key="created">
                    <Icons.CalendarDark size={16} />
                    <Typography className={classes.link}>
                        <Trans>Created on: {format(project.metadata.createdAt, 'MMMM do, yyyy')}</Trans>
                    </Typography>
                </Box>
            </Box>

            <Box className={classes.stats}>
                {stats.map((x, index) => (
                    <Box key={index} className={classes.statsItem}>
                        <Typography className={classes.statsValue}>{x.value}</Typography>
                        <Typography className={classes.statsTitle}>{x.title}</Typography>
                    </Box>
                ))}
            </Box>

            <Box>
                <TabContext value={currentTab}>
                    <MaskTabList onChange={onChange}>
                        <Tab label={<Trans>Project details</Trans>} value={tabs.detail} />
                        <Tab label={<Trans>Past rounds</Trans>} value={tabs.pastRounds} />
                    </MaskTabList>

                    <Box className={classes.tabContent}>
                        <TabPanel className={classes.panel} value={tabs.detail}>
                            <Box>
                                <Typography className={classes.subtitle}>
                                    <Trans>About</Trans>
                                </Typography>
                                <Markdown defaultStyle={false} className={classes.markdown}>
                                    {project.metadata.description}
                                </Markdown>
                            </Box>
                        </TabPanel>
                        <TabPanel className={classes.panel} value={tabs.pastRounds}>
                            {pastRounds.length ?
                                <Box className={classes.rounds}>
                                    {pastRounds.map((x, index) => (
                                        <RoundItem key={index} round={x.round} />
                                    ))}
                                </Box>
                            :   <Box className={classes.placeholder}>
                                    <Typography className={classes.placeholderTitle} style={{ textAlign: 'center' }}>
                                        <Trans>No past rounds found.</Trans>
                                    </Typography>
                                </Box>
                            }
                        </TabPanel>
                    </Box>
                </TabContext>
            </Box>
        </article>
    )
}

function RoundItem({ round }: { round: Round }) {
    const { classes } = useStyles()

    const roundType =
        (
            /* cspell:disable-next-line */
            round.strategyName === 'allov1.Direct' ||
            /* cspell:disable-next-line */
            round.strategyName === 'allov2.DirectGrantsSimpleStrategy' ||
            /* cspell:disable-next-line */
            round.strategyName === 'allov2.DirectGrantsLiteStrategy'
        ) ?
            'Direct grants'
        :   'Quadratic funding'

    const startTime = format(round.applicationsStartTime, 'MMMM do, yyyy')

    const endTime = format(round.donationsEndTime, 'MMMM do, yyyy')

    return (
        <Box className={classes.round}>
            <Typography className={classes.roundName}>{round.project.name}</Typography>
            <Typography className={classes.roundName}>{round.roundMetadata.name}</Typography>
            <Box display="flex" justifyContent="space-between" alignItems="flex-end">
                <Typography className={classes.roundName}>
                    {roundType === 'Quadratic funding' ?
                        <span>
                            {startTime} - {endTime}
                        </span>
                    :   <span>{startTime}</span>}
                </Typography>
                <Typography
                    className={classes.roundStatus}
                    style={{
                        background: roundType === 'Direct grants' ? 'rgba(255, 177, 0, 0.2)' : 'rgba(61, 194, 51, 0.2)',
                    }}>
                    {roundType}
                </Typography>
            </Box>
        </Box>
    )
}
