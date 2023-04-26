import { LoadingBase, MaskLightTheme, MaskTabList, makeStyles, useTabs } from '@masknet/theme'
import { CardContent, Stack, Tab, ThemeProvider, Typography } from '@mui/material'
import { useI18N } from '../../../utils/index.js'
import { PluginDescriptor } from './PluginDescriptor.js'
import { ProfileSpaceHeader } from './ProfileSpaceHeader.js'
import { ProfileCard, type ProfileCardProps } from './ProfileCard.js'
import type { DAOResult } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { TabContext } from '@mui/lab'
import { ContentTabs } from '../types.js'
import { useProposalList } from './hooks/useProposalList.js'
import { useMemo, useState, useTransition } from 'react'
import { ProfileProposalList } from './ProfileProposalList.js'
import { useSpace } from './hooks/useSpace.js'
import { Icons } from '@masknet/icons'

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
}))

export interface ProfileViewProps extends withClasses<'content' | 'footer'> {
    ProfileCardProps?: Partial<ProfileCardProps>
    spaceList: Array<DAOResult<ChainId.Mainnet>>
}

export function ProfileView(props: ProfileViewProps) {
    const { ProfileCardProps, spaceList } = props
    const { classes } = useStyles(undefined, { props })
    const { t } = useI18N()
    const [currentTab, , , setTab] = useTabs<ContentTabs>(
        ContentTabs.All,
        ContentTabs.Active,
        ContentTabs.Core,
        ContentTabs.Pending,
        ContentTabs.Closed,
    )
    const [spaceIndex, setSpaceIndex] = useState(0)

    const currentSpace = spaceList[spaceIndex]

    const { value: proposalList, loading: loadingProposalList } = useProposalList(currentSpace.spaceId)
    const { value: space, loading: loadingSpaceMemberList } = useSpace(currentSpace.spaceId)
    const [isPending, startTransition] = useTransition()
    const filteredProposalList = useMemo(() => {
        if (!proposalList || !space?.members) return
        if (currentTab === ContentTabs.All) return proposalList
        if (currentTab === ContentTabs.Core) return proposalList.filter((x) => space?.members?.includes(x.author))
        return proposalList.filter((x) => x.state.toLowerCase() === currentTab.toLowerCase())
    }, [currentTab, JSON.stringify(proposalList), JSON.stringify(space?.members)])

    return (
        <ProfileCard {...ProfileCardProps}>
            <Stack className={classes.root}>
                <ThemeProvider theme={MaskLightTheme}>
                    <PluginDescriptor />
                    <ProfileSpaceHeader
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
