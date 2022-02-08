import { useEffect, useState } from 'react'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { PluginCyberConnectRPC } from '../messages'
import { Skeleton } from '@mui/material'
import { useWeb3, formatEthereumAddress } from '@masknet/web3-shared-evm'
import Avatar from 'boring-avatars'
import ConnectButton from './ConnectButton'
import FollowTab from './FollowTab'
import { useAsyncRetry } from 'react-use'
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
    },
    address: { marginTop: '20px', opacity: 0.6 },
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
    const web3 = useWeb3()
    const [ethAddress, setEthAddress] = useState('')
    const { value: identity } = useAsyncRetry(async () => {
        const res = await PluginCyberConnectRPC.fetchIdentity(queryAddress)
        return res.data.identity
    }, [queryAddress])

    useEffect(() => {
        if (queryAddress.endsWith('.eth')) {
            web3.eth.ens.getAddress(queryAddress).then((res) => {
                setEthAddress(res)
            })
        } else {
            setEthAddress(queryAddress)
        }
    }, [queryAddress])

    return (
        <div className={classes.root}>
            <div className={classes.avatar}>
                {identity?.avatar ? (
                    <img src={identity.avatar} alt="" width={300} height={300} />
                ) : (
                    <Avatar name={queryAddress} square size={300} />
                )}
            </div>
            <div className={classes.userName}>{formatEthereumAddress(queryAddress, 14)}</div>

            {!identity ? (
                <Skeleton width={400} height={40} />
            ) : (
                <div className={classes.address}>{identity.address}</div>
            )}

            {ethAddress ? <ConnectButton address={ethAddress} /> : <Skeleton width={400} height={68} />}

            {!identity ? (
                <Skeleton width={400} height={100} />
            ) : (
                <FollowTab followingList={identity.followings.list} followerList={identity.followers.list} />
            )}
        </div>
    )
}

export default Profile
