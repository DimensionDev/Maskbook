import { Icons } from '@masknet/icons'
import { WalletMessages } from '@masknet/plugin-wallet'
import { PluginID } from '@masknet/shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { SocialAccount, SocialIdentity } from '@masknet/web3-shared-base'
import type { FC, HTMLProps } from 'react'
import { TipButton } from '../../../plugins/Tips/components/index.js'
import { useLastRecognizedIdentity } from '../../DataSource/useActivatedUI.js'
import { ProfileBar } from './ProfileBar.js'

const useStyles = makeStyles()((theme) => {
    return {
        title: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        profileBar: {
            width: '100%',
        },
        settingItem: {
            display: 'flex',
            alignItems: 'center',
            marginLeft: 'auto',
        },
        gearIcon: {
            color: theme.palette.text.primary,
            cursor: 'pointer',
        },
        tipButton: {
            width: 40,
            height: 40,
            borderRadius: 40,
            border: `1px solid ${theme.palette.maskColor.line}`,
        },
    }
})

export interface ProfileCardTitleProps extends HTMLProps<HTMLDivElement> {
    identity: SocialIdentity
    socialAccounts: Array<SocialAccount<Web3Helper.ChainIdAll>>
    address?: string
    onAddressChange?(address: string): void
}
export const ProfileCardTitle: FC<ProfileCardTitleProps> = ({
    className,
    socialAccounts,
    address,
    identity,
    onAddressChange,
    ...rest
}) => {
    const me = useLastRecognizedIdentity()
    const { classes, cx } = useStyles()
    const { setDialog } = useRemoteControlledDialog(WalletMessages.events.ApplicationDialogUpdated)
    const handleOpenDialog = () => {
        setDialog({
            open: true,
            settings: {
                quickMode: true,
                switchTab: {
                    focusPluginID: PluginID.Web3ProfileCard,
                },
            },
        })
    }

    return (
        <div className={cx(classes.title, className)} {...rest}>
            <ProfileBar
                className={classes.profileBar}
                identity={identity}
                socialAccounts={socialAccounts}
                address={address}
                onAddressChange={onAddressChange}>
                <div className={classes.settingItem}>
                    {identity.identifier?.userId === me?.identifier?.userId ? (
                        <Icons.Gear onClick={handleOpenDialog} className={classes.gearIcon} />
                    ) : (
                        <TipButton className={classes.tipButton} receiver={identity.identifier} />
                    )}
                </div>
            </ProfileBar>
        </div>
    )
}
