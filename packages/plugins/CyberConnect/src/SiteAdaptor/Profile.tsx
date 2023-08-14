import Avatar from 'boring-avatars'
import { useQuery } from '@tanstack/react-query'
import { makeStyles, MaskTabList, useTabs } from '@masknet/theme'
import { Link, Stack, Tab, Typography } from '@mui/material'
import { TabContext, TabPanel } from '@mui/lab'
import { ChainId, formatEthereumAddress } from '@masknet/web3-shared-evm'
import { FormattedAddress, CopyButton, ReloadStatus, LoadingStatus, EmptyStatus } from '@masknet/shared'
import { Icons } from '@masknet/icons'
import { ExplorerResolver } from '@masknet/web3-providers'
import ConnectButton from './ConnectButton.js'
import { FollowersPage } from './FollowersPage.js'
import { useI18N } from '../locales/index.js'
import { ProfileTab } from '../constants.js'
import { PluginCyberConnectRPC } from '../messages.js'

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 12,
        overflow: 'hidden',
    },
    avatar: {
        width: '64px',
        height: '64px',
        borderRadius: '8px',
        overflow: 'hidden',
        svg: {
            borderRadius: '8px',
        },
    },
    userName: {
        fontWeight: 700,
        fontSize: 20,
        lineHeight: '24px',
        width: 250,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    address: {
        fontSize: 14,
        fontWeight: 400,
        lineHeight: '18px',
        display: 'flex',
        alignItems: 'center',
        paddingTop: theme.spacing(1),
        flexDirection: 'row',
        gap: theme.spacing(0.5),
    },

    profile: {
        gap: 12,
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
    },
    icon: {
        width: 16,
        height: 16,
        color: theme.palette.maskColor.publicSecond,
    },
    PopupLink: {
        width: 16,
        height: 16,
        color: theme.palette.maskColor.publicSecond,
    },
    follow: {
        marginTop: theme.spacing(2),
        width: '100%',
    },
    panel: {
        padding: theme.spacing(2),
        backgroundColor: theme.palette.maskColor.white,
        '::-webkit-scrollbar': {
            display: 'none',
        },
        height: 400,
        overflowY: 'auto',
        borderRadius: '0 0 12px 12px',
    },
    tab: {
        whiteSpace: 'nowrap',
        background: 'transparent',
        color: theme.palette.maskColor.publicSecond,
        '&:hover': {
            background: 'transparent',
        },
    },
    tabActive: {
        background: '#fff',
        color: theme.palette.maskColor.publicMain,
        '&:hover': {
            background: '#fff',
        },
    },
}))

function Profile({ url }: { url: string }) {
    const t = useI18N()
    const { classes } = useStyles()
    const [, , , , queryAddress] = url.split('/')
    const {
        data: identity,
        isLoading,
        error,
        refetch,
    } = useQuery(['cyber-connect', 'identity', queryAddress], async () => {
        const res = await PluginCyberConnectRPC.fetchIdentity(queryAddress)
        return res.data.identity
    })

    const [currentTab, onChange, tabs] = useTabs(ProfileTab.Followings, ProfileTab.Followers)

    function getNodata() {
        return (
            <EmptyStatus height={400} p={2}>
                {currentTab === tabs.Followers ? t.no_followers() : t.no_followings()}
            </EmptyStatus>
        )
    }

    if (isLoading) return <LoadingStatus height={196} omitText />
    if (error) return <ReloadStatus height={196} message={t.failed()} onRetry={refetch} />

    return (
        <TabContext value={currentTab}>
            <div className={classes.root}>
                <Stack className={classes.profile}>
                    <Stack className={classes.avatar}>
                        {identity?.avatar ? (
                            <img src={identity.avatar} alt="" width={64} height={64} />
                        ) : (
                            <Avatar name={queryAddress} square size={64} />
                        )}
                    </Stack>

                    <Stack flex={1}>
                        <Typography className={classes.userName}>
                            {identity?.ens || (
                                <FormattedAddress
                                    address={identity?.address}
                                    formatter={formatEthereumAddress}
                                    size={4}
                                />
                            )}
                        </Typography>

                        <Stack className={classes.address}>
                            <Typography
                                color={(theme) => theme.palette.maskColor.publicMain}
                                lineHeight="18px"
                                fontSize="14px">
                                <FormattedAddress
                                    address={identity?.address}
                                    formatter={formatEthereumAddress}
                                    size={4}
                                />
                            </Typography>
                            <Link
                                onClick={(event) => event.stopPropagation()}
                                style={{ width: 16, height: 16 }}
                                href={ExplorerResolver.addressLink(ChainId.Mainnet, identity?.address ?? '')}
                                target="_blank"
                                rel="noopener noreferrer">
                                <Icons.PopupLink className={classes.PopupLink} size={16} />
                            </Link>
                            {identity?.address ? (
                                <CopyButton text={identity.address} className={classes.icon} size={16} />
                            ) : null}
                        </Stack>
                    </Stack>

                    <Stack alignItems="center" justifyContent="center">
                        <ConnectButton address={identity?.address ?? ''} />
                    </Stack>
                </Stack>

                <Stack className={classes.follow}>
                    <MaskTabList variant="base" onChange={onChange} aria-label="CyberConnection">
                        <Tab
                            label={t.followings()}
                            value={tabs.Followings}
                            className={tabs.Followings === currentTab ? classes.tabActive : classes.tab}
                        />
                        <Tab
                            label={t.followers()}
                            value={tabs.Followers}
                            className={tabs.Followers === currentTab ? classes.tabActive : classes.tab}
                        />
                    </MaskTabList>
                    <TabPanel value={tabs.Followings} className={classes.panel}>
                        <FollowersPage hint={getNodata()} address={identity?.address} tab={ProfileTab.Followings} />
                    </TabPanel>
                    <TabPanel value={tabs.Followers} className={classes.panel}>
                        <FollowersPage hint={getNodata()} address={identity?.address} tab={ProfileTab.Followers} />
                    </TabPanel>
                </Stack>
            </div>
        </TabContext>
    )
}

export default Profile
