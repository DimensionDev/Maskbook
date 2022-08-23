import { Icons } from '@masknet/icons'
import { PluginId } from '@masknet/plugin-infra'
import { WalletMessages } from '@masknet/plugin-wallet'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { makeStyles } from '@masknet/theme'
import { NetworkPluginID, SocialAddress, SocialAddressType, SocialIdentity } from '@masknet/web3-shared-base'
import { FC, HTMLProps, useMemo } from 'react'
import { TipButton } from '../../../plugins/Tips/components'
import type { TipAccount } from '../../../plugins/Tips/types'
import { useIsMyIdentity } from '../../DataSource/useActivatedUI'
import { ProfileBar } from './ProfileBar'

const useStyles = makeStyles()((theme) => {
    const isDark = theme.palette.mode === 'dark'
    return {
        title: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        settingItem: {
            display: 'flex',
            alignItems: 'center',
        },
        gearIcon: {
            color: theme.palette.text.primary,
        },
        tipButton: {
            width: 40,
            height: 40,
            borderRadius: 40,
            border: `1px solid ${isDark ? theme.palette.maskColor.publicLine : theme.palette.maskColor.line}`,
        },
    }
})

interface Props extends HTMLProps<HTMLDivElement> {
    identity: SocialIdentity
    socialAddressList: Array<SocialAddress<NetworkPluginID>>
    selectedAddress?: string
    onAddressChange?(address: string): void
}
export const ProfileCardTitle: FC<Props> = ({
    className,
    socialAddressList,
    selectedAddress,
    identity,
    onAddressChange,
    ...rest
}) => {
    const { classes, cx } = useStyles()
    const isMyIdentity = useIsMyIdentity(identity)
    const { setDialog } = useRemoteControlledDialog(WalletMessages.events.ApplicationDialogUpdated)
    const handleOpenDialog = () => {
        setDialog({
            open: true,
            settings: {
                switchTab: {
                    focusPluginId: PluginId.Web3ProfileCard,
                },
            },
        })
    }
    const tipAccounts: TipAccount[] = useMemo(() => {
        return socialAddressList.map((x) => ({
            address: x.address,
            name: x.label,
            verified: x.type === SocialAddressType.NEXT_ID,
        }))
    }, [socialAddressList])

    return (
        <div className={cx(classes.title, className)} {...rest}>
            <ProfileBar
                identity={identity}
                socialAddressList={socialAddressList}
                address={selectedAddress}
                onAddressChange={onAddressChange}
            />
            <div className={classes.settingItem}>
                {isMyIdentity ? (
                    <Icons.Gear onClick={handleOpenDialog} className={classes.gearIcon} sx={{ cursor: 'pointer' }} />
                ) : (
                    <TipButton className={classes.tipButton} receiver={identity.identifier} addresses={tipAccounts} />
                )}
            </div>
        </div>
    )
}
