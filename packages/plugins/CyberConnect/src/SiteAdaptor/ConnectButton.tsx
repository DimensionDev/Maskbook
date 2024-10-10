import { useState, useCallback, useMemo } from 'react'
import { useAsync } from 'react-use'
import { ActionButton, makeStyles } from '@masknet/theme'
import { isSameAddress } from '@masknet/web3-shared-base'
import { EVMWeb3 } from '@masknet/web3-providers'
import { useChainContext, useWallet } from '@masknet/web3-hooks-base'
import CyberConnect, { Env } from '@cyberlab/cyberconnect'
import { PluginCyberConnectRPC } from '../messages.js'
import { useSharedTrans, WalletConnectedBoundary } from '@masknet/shared'
import { Trans } from '@lingui/macro'

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
    const sharedI18N = useSharedTrans()
    const { classes, cx } = useStyles()
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
        return new CyberConnect({
            provider: EVMWeb3.getWeb3Provider(),
            namespace: 'Mask',
            env: process.env.NODE_ENV === 'production' ? Env.PRODUCTION : Env.STAGING,
        })
    }, [account])

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
                    {wallet?.owner ?
                        sharedI18N.coming_soon()
                    : !isFollowing ?
                        <Trans>Follow Now</Trans>
                    :   <Trans>Unfollow</Trans>}
                </ActionButton>
            </WalletConnectedBoundary>
        )
    }
    return null
}
