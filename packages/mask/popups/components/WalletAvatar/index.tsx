import { Icons } from '@masknet/icons'
import { Image } from '@masknet/shared'
import { NetworkPluginID, PersistentStorages } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { isSameAddress } from '@masknet/web3-shared-base'
import { useChainContext, useFireflyEmbeddedWallets } from '@masknet/web3-hooks-base'
import { getRegisteredWeb3Providers } from '@masknet/web3-providers'
import { memo, useMemo, type HTMLProps } from 'react'
import { useSubscription } from 'use-subscription'

const useStyles = makeStyles()((theme) => ({
    container: {
        position: 'relative',
    },
    badgeIcon: {
        position: 'absolute',
        right: -3,
        bottom: -1,
        border: `1px solid ${theme.vars.palette.common.white}`,
        borderRadius: '50%',
    },
}))

interface Props extends HTMLProps<HTMLDivElement> {
    size?: number
    badgeSize?: number
    address: string
}
export const WalletAvatar = memo<Props>(function WalletAvatar({ size = 30, address, badgeSize = 12, ...rest }) {
    const { classes, cx } = useStyles()
    const { wallets: fireflyWallets } = useFireflyEmbeddedWallets()
    const { providerType } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    const isFireflyWallet = useMemo(
        () => fireflyWallets.some((w) => isSameAddress(w.address, address)),
        [fireflyWallets, address],
    )
    const fireflyAccount = useSubscription(PersistentStorages.Settings.storage.firefly_account.subscription)

    const providerIcon = useMemo(
        () => getRegisteredWeb3Providers(NetworkPluginID.PLUGIN_EVM).find((x) => x.type === providerType)?.icon,
        [providerType],
    )

    if (isFireflyWallet && fireflyAccount)
        return (
            <div {...rest} className={cx(classes.container, rest.className)}>
                <Image size={size} src={fireflyAccount.avatar} rounded />
                <Icons.Firefly className={classes.badgeIcon} size={badgeSize} />
            </div>
        )
    if (providerIcon) return <img src={providerIcon} width={size} height={size} className={rest.className} />
    return <Icons.MaskBlue size={size} className={rest.className} />
})
