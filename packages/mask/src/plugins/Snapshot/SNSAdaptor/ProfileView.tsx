import { useMemo, useState, useTransition } from 'react'
import { useAsyncFn } from 'react-use'
import {
    ActionButton,
    LoadingBase,
    MaskDarkTheme,
    MaskLightTheme,
    MaskTabList,
    makeStyles,
    useTabs,
} from '@masknet/theme'
import { CardContent, Stack, Tab, ThemeProvider, Typography, useTheme } from '@mui/material'
import { ProfileCard, type ProfileCardProps } from './ProfileCard.js'
import type { DAOResult } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { TabContext } from '@mui/lab'
import { Icons } from '@masknet/icons'
import { PluginID } from '@masknet/shared-base'
import { useIsMinimalMode } from '@masknet/plugin-infra/content-script'
import { useI18N } from '../../../utils/index.js'
import { PluginDescriptor } from './PluginDescriptor.js'
import { ProfileSpaceHeader } from './ProfileSpaceHeader.js'
import { ContentTabs } from '../types.js'
import { useProposalList } from './hooks/useProposalList.js'
import { ProfileProposalList } from './ProfileProposalList.js'
import { useSpace } from './hooks/useSpace.js'
import Services from '../../../extension/service.js'

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
    minimalContent: {
        height: 148,
        paddingTop: 0,
        paddingBottom: 0,
        '&:last-child': {
            paddingBottom: 16,
        },
    },
    minimalText: {
        color: theme.palette.maskColor.dark,
        whiteSpace: 'nowrap',
    },
    tabListRoot: {
        marginTop: '10px !important',
        flexGrow: 0,
    },

    enableButton: {
        display: 'inline-flex',
        justifyContent: 'center',
        borderRadius: 20,
        width: 254,
        height: 40,
    },
}))

export interface ProfileViewProps extends withClasses<'content' | 'footer'> {
    ProfileCardProps?: Partial<ProfileCardProps>
    spaceList: Array<DAOResult<ChainId.Mainnet>>
}

export function ProfileView(props: ProfileViewProps) {
    const { ProfileCardProps, spaceList } = props
    const { classes } = useStyles(undefined, { props })
    const { t } = useI18N()
    const theme = useTheme()
    const [currentTab, , , setTab] = useTabs<ContentTabs>(
        ContentTabs.All,
        ContentTabs.Active,
        ContentTabs.Core,
        ContentTabs.Pending,
        ContentTabs.Closed,
    )
    const [spaceIndex, setSpaceIndex] = useState(0)

    const isMinimalMode = useIsMinimalMode(PluginID.Snapshot)

    const currentSpace = spaceList[spaceIndex]

    const { value: space, loading: loadingSpaceMemberList } = useSpace(currentSpace.spaceId)

    const { value: proposalList, loading: loadingProposalList } = useProposalList(
        currentSpace.spaceId,
        currentSpace.strategyName ?? space?.symbol,
    )

    const [{ loading: loadingModeEnabled }, onEnablePlugin] = useAsyncFn(async () => {
        await Services.Settings.setPluginMinimalModeEnabled(PluginID.Snapshot, false)
    }, [])

    const [isPending, startTransition] = useTransition()
    const filteredProposalList = useMemo(() => {
        if (!proposalList?.length || !space?.members) return
        if (currentTab === ContentTabs.All) return proposalList
        if (currentTab === ContentTabs.Core) return proposalList.filter((x) => space.members.includes(x.author))
        return proposalList.filter((x) => x.state.toLowerCase() === currentTab.toLowerCase())
    }, [currentTab, JSON.stringify(proposalList), JSON.stringify(space?.members)])

    if (isMinimalMode) {
        return (
            <ProfileCard {...ProfileCardProps}>
                <Stack className={classes.root}>
                    <ThemeProvider theme={MaskLightTheme}>
                        <PluginDescriptor />
                        <CardContent className={classes.minimalContent}>
                            <Stack height="100%" alignItems="center" justifyContent="end">
                                <Stack justifyContent="center" alignItems="center" width="100%" boxSizing="border-box">
                                    <Typography fontWeight={400} fontSize={14} className={classes.minimalText}>
                                        {t('enable_plugin_boundary_description')}
                                    </Typography>
                                </Stack>
                                <ActionButton
                                    loading={loadingModeEnabled}
                                    startIcon={<Icons.Plugin size={18} />}
                                    className={classes.enableButton}
                                    color="primary"
                                    onClick={onEnablePlugin}
                                    sx={{ mt: 6 }}>
                                    {t('enable_plugin_boundary')}
                                </ActionButton>
                            </Stack>
                        </CardContent>
                    </ThemeProvider>
                </Stack>
            </ProfileCard>
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
                        setSpaceIndex={setSpaceIndex}
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
            {loadingProposalList || loadingSpaceMemberList || !filteredProposalList || isPending ? (
                <CardContent className={classes.skeletonContent}>
                    <Stack height="100%" alignItems="center" justifyContent="center">
                        <LoadingBase />
                        <Typography fontSize="14px" mt={1.5}>
                            {t('loading')}
                        </Typography>
                    </Stack>
                </CardContent>
            ) : filteredProposalList.length > 0 ? (
                <ProfileProposalList proposalList={filteredProposalList} />
            ) : (
                <CardContent className={classes.skeletonContent}>
                    <Stack height="100%" alignItems="center" justifyContent="center">
                        <Icons.EmptySimple size={36} />
                        <Typography fontSize="14px" mt={1.5}>
                            {t('plugin_snapshot_proposal_no_results')}
                        </Typography>
                    </Stack>
                </CardContent>
            )}
        </ProfileCard>
    )
}
