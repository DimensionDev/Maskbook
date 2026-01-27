import { Icons } from '@masknet/icons'
import { Image } from '@masknet/shared'
import { PersistentStorages } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { isSameAddress } from '@masknet/web3-shared-base'
import { useWallets } from '@privy-io/react-auth'
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
        border: `1px solid ${theme.palette.common.white}`,
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
    const { wallets: fireflyWallets } = useWallets()

    const isFireflyWallet = useMemo(
        () => fireflyWallets.some((w) => isSameAddress(w.address, address)),
        [fireflyWallets, address],
    )
    const fireflyAccount = useSubscription(PersistentStorages.Settings.storage.firefly_account.subscription)

    if (isFireflyWallet && fireflyAccount)
        return (
            <div {...rest} className={cx(classes.container, rest.className)}>
                <Image size={size} src={fireflyAccount.avatar} rounded />
                <Icons.Firefly className={classes.badgeIcon} size={badgeSize} />
            </div>
        )
    return <Icons.MaskBlue size={size} className={rest.className} />
})
