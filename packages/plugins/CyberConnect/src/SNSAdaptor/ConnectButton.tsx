import { useEffect, useState, useCallback } from 'react'
import { useAsync } from 'react-use'
import { makeStyles } from '@masknet/theme'
import { isSameAddress } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext, useWeb3, useNetworkContext } from '@masknet/web3-hooks-base'
import CyberConnect, { Env } from '@cyberlab/cyberconnect'
import { Button } from '@mui/material'
import { PluginCyberConnectRPC } from '../messages.js'
import { WalletConnectedBoundary } from '@masknet/shared'
import { useI18N } from '../locales/i18n_generated.js'

const useStyles = makeStyles()((theme) => ({
    button: {
        display: 'flex',
        alignItems: 'center',
        fontSize: 12,
        padding: '8px 12px',
    },
    wallet: {
        padding: '8px 12px',
        fontSize: 12,
        color: theme.palette.maskColor.white,
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
}))

export default function ConnectButton({
    address,
    refreshFollowList,
}: {
    address: string
    refreshFollowList: () => void
}) {
    const t = useI18N()
    const { classes, cx } = useStyles()
    const web3 = useWeb3(NetworkPluginID.PLUGIN_EVM)
    const { pluginID } = useNetworkContext()
    const { account } = useChainContext()
    const [cc, setCC] = useState<CyberConnect | null>(null)
    const [isFollowing, setFollowing] = useState(false)
    const [isLoading, setLoading] = useState(false)

    useAsync(async () => {
        if (isSameAddress(account, address)) return
        const res = await PluginCyberConnectRPC.fetchFollowStatus(account, address)
        setFollowing(res.data.followStatus.isFollowing)
    }, [address, account])

    useEffect(() => {
        if (!web3?.eth.currentProvider) return
        const ccInstance = new CyberConnect({
            provider: web3.eth.currentProvider,
            namespace: 'Mask',
            env: process.env.NODE_ENV === 'production' ? Env.PRODUCTION : Env.STAGING,
        })

        setCC(ccInstance)
    }, [web3, account])

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
    }, [cc, account, isFollowing])

    if (!isSameAddress(account, address)) {
        return (
            <WalletConnectedBoundary
                hideRiskWarningConfirmed
                ActionButtonProps={{ variant: 'roundedDark' }}
                classes={{ button: classes.wallet }}>
                <Button
                    className={cx(classes.button, { [classes.isFollowing]: isFollowing })}
                    onClick={handleClick}
                    variant="roundedContained">
                    {!isFollowing ? t.unfollow() : t.follow_now()}
                </Button>
                <div />
            </WalletConnectedBoundary>
        )
    }
    return null
}
