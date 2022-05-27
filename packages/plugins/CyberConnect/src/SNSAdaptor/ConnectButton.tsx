import { useEffect, useState, useCallback } from 'react'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { useWeb3, isSameAddress } from '@masknet/web3-shared-evm'
import { useAccount, useCurrentWeb3NetworkPluginID, NetworkPluginID } from '@masknet/plugin-infra/web3'
import CyberConnect, { Env } from '@cyberlab/cyberconnect'
import { PluginCyberConnectRPC } from '../messages'
import { CircularProgress, useTheme, Typography } from '@mui/material'
import { useAsync } from 'react-use'

const useStyles = makeStyles()(() => ({
    button: {
        width: '350px',
        display: 'flex',
        alignItems: 'center',
        background: MaskColorVar.cyberconnectPrimary,
        fontSize: '20px',
        color: MaskColorVar.twitterBottom,
        marginTop: '30px',
        borderRadius: '4px',
        padding: '20px 20px 20px 30px',
        transition: 'all .3s ease',
        '>svg': {
            marginRight: '20px',
            transition: 'all .3s ease',
        },
        cursor: 'pointer',
        '&:hover': {
            opacity: 0.8,
            '>svg': {
                '&:nth-of-type(1)': {
                    transformOrigin: 'calc(100% + 1px) center',
                    transform: 'rotate(-45deg) translate(2px,0)',
                },
                '&:nth-of-type(2)': {
                    transformOrigin: '-1px center',
                    transform: 'rotate(135deg) translate(-8px,0)',
                },
            },
        },
    },
    isFollowing: {
        '&:hover': {
            opacity: 1,
        },
        '>svg': {
            '&:nth-of-type(1)': {
                transformOrigin: 'calc(100% + 1px) center',
                transform: 'rotate(-45deg) translate(2px,0)',
            },
            '&:nth-of-type(2)': {
                transformOrigin: '-1px center',
                transform: 'rotate(135deg) translate(-8px,0)',
            },
        },
    },
    reverse: {
        transform: 'rotate(180deg)',
        marginLeft: '-18px',
    },
}))
const Logo = function () {
    const { classes } = useStyles()
    const mode = useTheme().palette.mode
    return (
        <>
            <svg
                width="9"
                height="16"
                viewBox="0 0 9 16"
                fill={mode === 'light' ? '#fff' : '#000'}
                xmlns="http://www.w3.org/2000/svg">
                <path d="M0.21737 1.67136L5.84807 7.30347C6.03273 7.48961 6.13636 7.74119 6.13636 8.0034C6.13636 8.26561 6.03273 8.51719 5.84807 8.70333L0.21737 14.334C0.150231 14.4011 0.0969715 14.4808 0.0606343 14.5685C0.024297 14.6562 0.0055959 14.7502 0.0055959 14.8451C0.0055959 14.9401 0.024297 15.0341 0.0606343 15.1218C0.0969715 15.2095 0.150231 15.2891 0.21737 15.3562L0.643293 15.7822C0.710401 15.8493 0.790081 15.9026 0.877779 15.9389C0.965476 15.9752 1.05947 15.9939 1.1544 15.9939C1.24933 15.9939 1.34332 15.9752 1.43102 15.9389C1.51872 15.9026 1.5984 15.8493 1.66551 15.7822L8.54132 8.90636C8.66087 8.78702 8.75572 8.64527 8.82043 8.48923C8.88514 8.3332 8.91845 8.16594 8.91845 7.99701C8.91845 7.82809 8.88514 7.66083 8.82043 7.50479C8.75572 7.34876 8.66087 7.20701 8.54132 7.08767L1.66551 0.211857C1.58716 0.13357 1.49189 0.0743072 1.38704 0.0386179C1.28218 0.00292854 1.17054 -0.00822914 1.0607 0.00600124C0.894222 0.0315557 0.740666 0.110823 0.623418 0.231735L0.211694 0.644885C0.144112 0.712348 0.0905984 0.792554 0.0542609 0.880862C0.0179234 0.969169 -0.000517259 1.06382 1.1038e-05 1.15931C0.000539335 1.2548 0.0200247 1.34923 0.0573371 1.43713C0.0946495 1.52503 0.149046 1.60464 0.21737 1.67136Z" />
            </svg>
            <svg
                className={classes.reverse}
                width="9"
                height="16"
                viewBox="0 0 9 16"
                fill={mode === 'light' ? '#fff' : '#000'}
                xmlns="http://www.w3.org/2000/svg">
                <path d="M0.21737 1.67136L5.84807 7.30347C6.03273 7.48961 6.13636 7.74119 6.13636 8.0034C6.13636 8.26561 6.03273 8.51719 5.84807 8.70333L0.21737 14.334C0.150231 14.4011 0.0969715 14.4808 0.0606343 14.5685C0.024297 14.6562 0.0055959 14.7502 0.0055959 14.8451C0.0055959 14.9401 0.024297 15.0341 0.0606343 15.1218C0.0969715 15.2095 0.150231 15.2891 0.21737 15.3562L0.643293 15.7822C0.710401 15.8493 0.790081 15.9026 0.877779 15.9389C0.965476 15.9752 1.05947 15.9939 1.1544 15.9939C1.24933 15.9939 1.34332 15.9752 1.43102 15.9389C1.51872 15.9026 1.5984 15.8493 1.66551 15.7822L8.54132 8.90636C8.66087 8.78702 8.75572 8.64527 8.82043 8.48923C8.88514 8.3332 8.91845 8.16594 8.91845 7.99701C8.91845 7.82809 8.88514 7.66083 8.82043 7.50479C8.75572 7.34876 8.66087 7.20701 8.54132 7.08767L1.66551 0.211857C1.58716 0.13357 1.49189 0.0743072 1.38704 0.0386179C1.28218 0.00292854 1.17054 -0.00822914 1.0607 0.00600124C0.894222 0.0315557 0.740666 0.110823 0.623418 0.231735L0.211694 0.644885C0.144112 0.712348 0.0905984 0.792554 0.0542609 0.880862C0.0179234 0.969169 -0.000517259 1.06382 1.1038e-05 1.15931C0.000539335 1.2548 0.0200247 1.34923 0.0573371 1.43713C0.0946495 1.52503 0.149046 1.60464 0.21737 1.67136Z" />
            </svg>
        </>
    )
}
export default function ConnectButton({
    address,
    refreshFollowList,
}: {
    address: string
    refreshFollowList: () => void
}) {
    const { classes, cx } = useStyles()
    const web3 = useWeb3()
    const myAddress = useAccount()
    const [cc, setCC] = useState<CyberConnect | null>(null)
    const [isFollowing, setFollowing] = useState(false)
    const [isLoading, setLoading] = useState(false)
    const blockChainNetwork = useCurrentWeb3NetworkPluginID()
    useAsync(async () => {
        if (isSameAddress(myAddress, address)) return
        const res = await PluginCyberConnectRPC.fetchFollowStatus(myAddress, address)
        setFollowing(res.data.followStatus.isFollowing)
    }, [address, myAddress])

    useEffect(() => {
        if (!web3.eth.currentProvider) return
        const ccInstance = new CyberConnect({
            provider: web3.eth.currentProvider,
            namespace: 'Mask',
            env: process.env.NODE_ENV === 'production' ? Env.PRODUCTION : Env.STAGING,
        })

        setCC(ccInstance)
    }, [web3, myAddress])

    const handleClick = useCallback(() => {
        if (!cc) return
        setLoading(true)
        if (!isFollowing) {
            cc.connect(address)
                .then(() => {
                    setFollowing(true)
                    refreshFollowList()
                })
                .finally(() => setLoading(false))
        } else {
            cc.disconnect(address)
                .then(() => {
                    setFollowing(false)
                    refreshFollowList()
                })
                .finally(() => setLoading(false))
        }
    }, [cc, myAddress, isFollowing])

    if (blockChainNetwork !== NetworkPluginID.PLUGIN_EVM) {
        return (
            <Typography variant="body2" sx={{ marginTop: 2 }}>
                Please switch to EVM-based wallet to follow
            </Typography>
        )
    } else if (!isSameAddress(myAddress, address)) {
        return (
            <div className={cx(classes.button, { [classes.isFollowing]: isFollowing })} onClick={handleClick}>
                {!isLoading ? (
                    <>
                        <Logo /> <Typography variant="button">{!isFollowing ? 'Follow Now' : 'Following'}</Typography>
                    </>
                ) : (
                    <CircularProgress size={30} sx={{ marginLeft: '154px' }} />
                )}
            </div>
        )
    }
    return null
}
