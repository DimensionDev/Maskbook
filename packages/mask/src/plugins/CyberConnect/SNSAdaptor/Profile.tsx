import { useEffect, useState } from 'react'
import { makeStyles } from '@masknet/theme'
import Avatar from 'boring-avatars'
import { PluginCyberConnectRPC } from '../messages'
import RelationShip from './RelationShip'
import { Skeleton } from '@mui/material'
import { useWeb3 } from '@masknet/web3-shared-evm'
import { getAssetAsBlobURL } from '../../../utils'
import ConnectButton from './ConnectButton'
import FollowTab from './FollowTab'
const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: theme.spacing(1),
        overflow: 'hidden',
    },
    avatar: {
        width: '350px',
        svg: {
            borderRadius: '4px',
        },
    },
    userName: {
        fontFamily: 'Poppins',
        fontWeight: 800,
        fontSize: '32px',
        lineHeight: '35px',
        width: '100%',
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
}))
const Profile = ({ url }: { url: string }) => {
    const { classes } = useStyles()
    const [, , , , queryAddress] = url.split('/')
    const [identity, setIdentity] = useState<any>(null)
    const web3 = useWeb3()
    const [ethAddress, setEthAddress] = useState<string>('')
    const SocialMedia = [
        {
            name: 'opensea',
            icon: getAssetAsBlobURL(new URL('../assets/Opensea.png', import.meta.url)),
            link: 'https://opensea.io/',
        },
        {
            name: 'rarible',
            icon: getAssetAsBlobURL(new URL('../assets/Rarible.png', import.meta.url)),
            link: 'https://rarible.com/user/',
        },
        {
            name: 'foundation',
            icon: getAssetAsBlobURL(new URL('../assets/Foundation.png', import.meta.url)),
            link: 'https://foundation.app/',
        },
        {
            name: 'context',
            icon: getAssetAsBlobURL(new URL('../assets/Context.png', import.meta.url)),
            link: 'https://context.app/',
        },
    ]
    useEffect(() => {
        if (queryAddress.endsWith('.eth')) {
            web3.eth.ens.getAddress(queryAddress).then((res) => {
                setEthAddress(res)
            })
        } else {
            setEthAddress(queryAddress)
        }
    }, [queryAddress])
    useEffect(() => {
        ;(async function () {
            const res = await PluginCyberConnectRPC.fetchIdentity(queryAddress)
            setIdentity(res.data.identity)
        })()
    }, [queryAddress])

    return (
        <div className={classes.root}>
            <div className={classes.avatar}>
                <Avatar name={queryAddress} square={true} size={350} />
            </div>
            <div className={classes.userName}>{queryAddress}</div>

            {!identity ? (
                <Skeleton width={400} height={40} />
            ) : (
                <div className={classes.address}>{identity.address}</div>
            )}

            <div className={classes.socialMedia}>
                {ethAddress ? (
                    SocialMedia.map((s) => {
                        return (
                            <img
                                key={s.name}
                                className={classes.icon}
                                src={s.icon}
                                alt="social media"
                                onClick={() => {
                                    window.open(s.link + ethAddress)
                                }}
                            />
                        )
                    })
                ) : (
                    <Skeleton width={400} height={40} />
                )}
            </div>

            {!identity ? (
                <Skeleton width={400} height={100} />
            ) : (
                <RelationShip followingCount={identity.followingCount} followerCount={identity.followerCount} />
            )}
            {ethAddress ? <ConnectButton address={ethAddress} /> : <Skeleton width={400} height={40} />}
            {!identity ? (
                <Skeleton width={400} height={100} />
            ) : (
                <FollowTab followingList={identity.followings.list} followerList={identity.followers.list} />
            )}
        </div>
    )
}

export default Profile
