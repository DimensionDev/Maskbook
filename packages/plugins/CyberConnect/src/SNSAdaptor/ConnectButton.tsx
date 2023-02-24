import { useState, useCallback, useMemo } from 'react'
import { useAsync } from 'react-use'
import { ActionButton, makeStyles } from '@masknet/theme'
import { isSameAddress } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext, useWeb3, useNetworkContext, useWallet } from '@masknet/web3-hooks-base'
import CyberConnect, { Env } from '@cyberlab/cyberconnect'
import { PluginCyberConnectRPC } from '../messages.js'
import { useI18N } from '../locales/i18n_generated.js'
import { useSharedI18N, WalletConnectedBoundary } from '@masknet/shared'

const useStyles = makeStyles()((theme) => ({
    button: {
        display: 'flex',
        alignItems: 'center',
        fontSize: 12,
        padding: '8px 12px',
        backgroundColor: theme.palette.maskColor.publicMain,
        color: theme.palette.maskColor.white,
        '&:hover': {
            backgroundColor: theme.palette.maskColor.publicMain,
            color: theme.palette.maskColor.white,
        },
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

export default function ConnectButton({ address }: { address: string }) {
    const t = useI18N()
    const sharedI18N = useSharedI18N()
    const { classes, cx } = useStyles()
    const web3 = useWeb3(NetworkPluginID.PLUGIN_EVM)
    const { pluginID } = useNetworkContext()
    const { account, chainId } = useChainContext()
    const wallet = useWallet()
    const [isFollowing, setFollowing] = useState(false)
    const [isLoading, setLoading] = useState(false)

    useAsync(async () => {
        if (isSameAddress(account, address)) return
        const res = await PluginCyberConnectRPC.fetchFollowStatus(account, address)
        setFollowing(res.isFollowing)
    }, [address, account])

    const ccInstance = useMemo(() => {
        if (!web3?.eth.currentProvider) return
        return new CyberConnect({
            provider: web3.eth.currentProvider,
            namespace: 'Mask',
            env: process.env.NODE_ENV === 'production' ? Env.PRODUCTION : Env.STAGING,
        })
    }, [web3, account])

    const handleClick = useCallback(() => {
        if (!ccInstance) return
        setLoading(true)
        if (!isFollowing) {
            ccInstance
                .connect(address)
                .then(() => {
                    setFollowing(true)
                })
                .finally(() => setLoading(false))
        } else {
            ccInstance
                .disconnect(address)
                .then(() => {
                    setFollowing(false)
                })
                .finally(() => setLoading(false))
        }
    }, [ccInstance, address, isFollowing])

    const buttonText = useMemo(() => {
        if (wallet?.owner) sharedI18N.coming_soon()
        return !isFollowing ? t.follow_now() : t.unfollow()
    }, [wallet?.owner, isFollowing])

    if (!isSameAddress(account, address)) {
        return (
            <WalletConnectedBoundary
                offChain
                expectedChainId={chainId}
                hideRiskWarningConfirmed
                ActionButtonProps={{ variant: 'roundedDark' }}
                classes={{ button: classes.wallet }}>
                <ActionButton
                    loading={isLoading}
                    className={cx(classes.button, { [classes.isFollowing]: isFollowing })}
                    onClick={handleClick}
                    variant="roundedContained"
                    disabled={!!wallet?.owner}>
                    {buttonText}
                </ActionButton>
            </WalletConnectedBoundary>
        )
    }
    return null
}
