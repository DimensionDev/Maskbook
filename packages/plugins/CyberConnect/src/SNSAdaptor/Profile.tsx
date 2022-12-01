import { LoadingBase, makeStyles, MaskTabList, useTabs } from '@masknet/theme'
import { PluginCyberConnectRPC } from '../messages.js'
import { Box, Link, Skeleton, Stack, Tab, Typography } from '@mui/material'
import ConnectButton from './ConnectButton.js'
import { FollowRow } from './FollowTab.js'
import { useAsyncRetry } from 'react-use'
import Avatar from 'boring-avatars'
import { ChainId, explorerResolver, formatEthereumAddress } from '@masknet/web3-shared-evm'
import { CopyIconButton, FormattedAddress } from '@masknet/shared'
import { Icons } from '@masknet/icons'
import { TabContext, TabPanel } from '@mui/lab'
import { useI18N } from '../locales/index.js'
import type { IFollowIdentity } from '../Worker/apis/index.js'

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: theme.spacing(2),
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
    },
    PopupLink: {
        width: 16,
        height: 16,
        transform: 'translate(0px, -2px)',
    },
    follow: {
        marginTop: theme.spacing(2),
        width: '100%',
    },
    tab: {
        padding: theme.spacing(2),
        backgroundColor: theme.palette.maskColor.white,
        '::-webkit-scrollbar': {
            display: 'none',
        },
        height: 400,
    },
    statusBox: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 400,
    },
}))
const Profile = ({ url }: { url: string }) => {
    const t = useI18N()
    const { classes } = useStyles()
    const [, , , , queryAddress] = url.split('/')
    const {
        value: identity,
        loading,
        retry,
    } = useAsyncRetry(async () => {
        const res = await PluginCyberConnectRPC.fetchIdentity(queryAddress)
        return res.data.identity
    }, [queryAddress])

    const [currentTab, onChange, tabs] = useTabs('Followings', 'Followers')

    const Nodata = () => {
        const t = useI18N()
        return (
            <Box className={classes.statusBox} p={2}>
                <Icons.EmptySimple size={32} />
                <Typography color={(theme) => theme.palette.maskColor.publicSecond} fontSize="14px" fontWeight={400}>
                    {t.no_data()}
                </Typography>
            </Box>
        )
    }

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
                        <Typography className={classes.userName}>{identity?.ens || identity?.address}</Typography>
                        {loading ? (
                            <LoadingBase />
                        ) : (
                            <Stack className={classes.address}>
                                <FormattedAddress
                                    address={identity?.address}
                                    formatter={formatEthereumAddress}
                                    size={4}
                                />
                                <Link
                                    onClick={(event) => event.stopPropagation()}
                                    style={{ width: 12, height: 12 }}
                                    href={explorerResolver.addressLink(ChainId.Mainnet, identity?.address ?? '')}
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    <Icons.PopupLink className={classes.PopupLink} />
                                </Link>
                                <CopyIconButton text={identity?.address ?? ''} className={classes.icon} />
                            </Stack>
                        )}
                    </Stack>

                    <Stack alignItems="center" justifyContent="center">
                        <ConnectButton address={identity?.address ?? ''} refreshFollowList={retry} />
                    </Stack>
                </Stack>

                {!identity ? (
                    <Skeleton width="100%" height={400} />
                ) : (
                    <Stack className={classes.follow}>
                        <MaskTabList variant="base" onChange={onChange} aria-label="CyberConnection">
                            <Tab label={t.followings()} value={tabs.Followings} />
                            <Tab label={t.followers()} value={tabs.Followers} />
                        </MaskTabList>
                        <TabPanel value={tabs.Followings} className={classes.tab}>
                            {identity.followings.list.length ? (
                                identity.followings.list.map((f: IFollowIdentity) => {
                                    return <FollowRow key={f.address} identity={f} />
                                })
                            ) : (
                                <Nodata />
                            )}
                        </TabPanel>
                        <TabPanel value={tabs.Followers} className={classes.tab}>
                            {identity.followers.list.length ? (
                                identity.followers.list.map((f: IFollowIdentity) => {
                                    return <FollowRow key={f.address} identity={f} />
                                })
                            ) : (
                                <Nodata />
                            )}
                        </TabPanel>
                    </Stack>
                )}
            </div>
        </TabContext>
    )
}

export default Profile
