import { useMemo, useState, useTransition } from 'react'
import { LoadingBase, MaskDarkTheme, MaskLightTheme, MaskTabList, makeStyles, useTabs } from '@masknet/theme'
import { CardContent, Stack, Tab, ThemeProvider, Typography, useTheme } from '@mui/material'
import { PluginCardFrameMini, PluginEnableBoundary } from '@masknet/shared'
import type { DAOResult } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { TabContext } from '@mui/lab'
import { Icons } from '@masknet/icons'
import { EMPTY_LIST, PluginID } from '@masknet/shared-base'
import { useIsMinimalMode } from '@masknet/plugin-infra/content-script'
import { PluginDescriptor } from './PluginDescriptor.js'
import { ProfileSpaceHeader } from './ProfileSpaceHeader.js'
import { ContentTabs } from '../types.js'
import { useProposalList } from './hooks/useProposalList.js'
import { useSpace } from './hooks/useSpace.js'
import { useSnapshotTrans } from '../locales/index.js'
import { ProfileCard, type ProfileCardProps } from './ProfileCard.js'
import { ProfileProposalList } from './ProfileProposalList.js'

const useStyles = makeStyles()((theme) => ({
    root: {
        padding: theme.spacing(1, 1.5),
        paddingBottom: 0,
        background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(28, 104, 243, 0.2) 0%, rgba(69, 163, 251, 0.2) 100%), #FFFFFF;',
    },
    skeletonContent: {
        height: 300,
        paddingTop: 0,
        paddingBottom: 0,
        borderBottom: `1px solid ${theme.palette.maskColor.line}`,
    },
    tabListRoot: {
        marginTop: '10px !important',
        flexGrow: 0,
    },
    iconSnapshot: {
        marginRight: 6,
        marginTop: 2,
    },
}))

interface ProfileViewProps extends withClasses<'content' | 'footer'> {
    ProfileCardProps?: Partial<ProfileCardProps>
    spaceList: Array<DAOResult<ChainId.Mainnet>>
}

export function ProfileView(props: ProfileViewProps) {
    const { ProfileCardProps, spaceList } = props
    const { classes } = useStyles()
    const t = useSnapshotTrans()
    const theme = useTheme()
    const [currentTab, , , setTab] = useTabs<ContentTabs>(
        ContentTabs.All,
        ContentTabs.Active,
        ContentTabs.Core,
        ContentTabs.Pending,
        ContentTabs.Closed,
    )

    const isMinimalMode = useIsMinimalMode(PluginID.Snapshot)

    const [spaceId = spaceList[0]?.spaceId, setSpaceId] = useState<string>()
    const currentSpace = spaceList.find((x) => x.spaceId === spaceId) || spaceList[0]

    const { data: space, isPending: loadingSpaceMemberList } = useSpace(spaceId)

    const { data: proposalList, isPending: loadingProposalList } = useProposalList(
        currentSpace.spaceId,
        currentSpace.strategyName ?? space?.symbol,
    )

    const [isPending, startTransition] = useTransition()
    const filteredProposalList = useMemo(() => {
        if (!proposalList?.length || !space?.members) return EMPTY_LIST
        if (currentTab === ContentTabs.All) return proposalList
        if (currentTab === ContentTabs.Core) return proposalList.filter((x) => space.members.includes(x.author))
        return proposalList.filter((x) => x.state.toLowerCase() === currentTab.toLowerCase())
    }, [currentTab, proposalList, space?.members])

    if (isMinimalMode) {
        return (
            <PluginCardFrameMini
                title={t.plugin_snapshot_info_snapshot()}
                icon={<Icons.Snapshot className={classes.iconSnapshot} />}>
                <ThemeProvider theme={MaskLightTheme}>
                    <PluginEnableBoundary pluginID={PluginID.Snapshot}>
                        <PluginDescriptor />
                    </PluginEnableBoundary>
                </ThemeProvider>
            </PluginCardFrameMini>
        )
    }

    return (
        <ProfileCard {...ProfileCardProps}>
            <Stack className={classes.root}>
                <ThemeProvider theme={MaskLightTheme}>
                    <PluginDescriptor />
                    <ProfileSpaceHeader
                        theme={theme.palette.mode === 'light' ? MaskLightTheme : MaskDarkTheme}
                        spaceList={spaceList}
                        currentSpace={{
                            ...currentSpace,
                            followersCount: space?.followersCount ?? currentSpace.followersCount,
                        }}
                        setSpaceId={setSpaceId}
                    />
                </ThemeProvider>
                <TabContext value={currentTab}>
                    <Stack px={2}>
                        <MaskTabList
                            variant="base"
                            classes={{ root: classes.tabListRoot }}
                            onChange={(_, v: ContentTabs) => startTransition(() => setTab(v))}
                            aria-label="Space Status Tabs">
                            {Object.values(ContentTabs).map((x) => {
                                return <Tab value={x} key={x} label={x} />
                            })}
                        </MaskTabList>
                    </Stack>
                </TabContext>
            </Stack>
            {loadingProposalList || loadingSpaceMemberList || isPending ?
                <CardContent className={classes.skeletonContent}>
                    <Stack height="100%" alignItems="center" justifyContent="center">
                        <LoadingBase />
                        <Typography fontSize="14px" mt={1.5}>
                            {t.loading()}
                        </Typography>
                    </Stack>
                </CardContent>
            : filteredProposalList.length > 0 ?
                <ProfileProposalList proposalList={filteredProposalList} />
            :   <CardContent className={classes.skeletonContent}>
                    <Stack height="100%" alignItems="center" justifyContent="center">
                        <Icons.EmptySimple size={36} />
                        <Typography fontSize="14px" mt={1.5}>
                            {t.plugin_snapshot_proposal_no_results()}
                        </Typography>
                    </Stack>
                </CardContent>
            }
        </ProfileCard>
    )
}
