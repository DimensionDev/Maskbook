import { makeStyles, MaskColorVar } from '@masknet/theme'
import { PluginCyberConnectRPC } from '../messages'
import { Skeleton, Typography } from '@mui/material'
import { formatEthereumAddress, useAccount, useChainId } from '@masknet/web3-shared-evm'
import Avatar from 'boring-avatars'
import ConnectButton from './ConnectButton'
import FollowTab from './FollowTab'
import { useAsyncRetry } from 'react-use'
import { CyberConnectChainBoundary } from './PluginChainBoundary'
const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: theme.spacing(1),
        overflow: 'hidden',
    },
    avatar: {
        width: '300px',
        height: '300px',
        borderRadius: '10px',
        overflow: 'hidden',
        svg: {
            borderRadius: '4px',
        },
        transition: 'all .3s ease',
        '&:hover': {
            borderRadius: '40px',
            transform: 'rotate(-5deg)',
            boxShadow: '0 40px 80px rgba(0, 0, 0, 0.5)',
        },
    },
    userName: {
        fontFamily: 'Poppins',
        fontWeight: 800,
        fontSize: '32px',
        lineHeight: '35px',
        width: '350px',
        textAlign: 'center',
        wordBreak: 'break-word',
        marginTop: '20px',
        color: 'black',
    },
    address: { marginTop: '20px', opacity: 0.6, color: 'black' },
    socialMedia: {
        width: '100%',
        display: 'flex',
        alignContent: 'center',
        justifyContent: 'center',
        marginTop: '20px',
    },
    icon: {
        display: 'block',
        width: '30px',
        height: '30px',
        marginLeft: '15px',
        cursor: 'pointer',
    },
    author: {
        fill: MaskColorVar.secondaryBackground,
        cursor: 'pointer',
    },
}))
const Profile = ({ url }: { url: string }) => {
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
    const chainId = useChainId()
    const account = useAccount()

    return (
        <>
            <div className={classes.root}>
                <div className={classes.avatar}>
                    {identity?.avatar ? (
                        <img src={identity.avatar} alt="" width={300} height={300} />
                    ) : (
                        <Avatar name={queryAddress} square size={300} />
                    )}
                </div>
                <Typography className={classes.userName} component="div">
                    {identity?.ens || formatEthereumAddress(queryAddress, 4)}
                </Typography>

                {!identity ? (
                    <Skeleton width={400} height={40} />
                ) : (
                    <Typography className={classes.address} component="div">
                        {identity.address}
                    </Typography>
                )}

                {/* eslint-disable-next-line no-nested-ternary */}
                {!loading ? (
                    identity && account ? (
                        <ConnectButton address={identity?.address} refreshFollowList={retry} />
                    ) : null
                ) : (
                    <Skeleton width={400} height={68} />
                )}

                {!identity ? (
                    <Skeleton width={400} height={100} />
                ) : (
                    <FollowTab followingList={identity.followings.list} followerList={identity.followers.list} />
                )}
            </div>
            <div style={{ padding: 12 }}>
                <CyberConnectChainBoundary renderInTimeline chainId={chainId} />
            </div>
        </>
    )
}

export default Profile
