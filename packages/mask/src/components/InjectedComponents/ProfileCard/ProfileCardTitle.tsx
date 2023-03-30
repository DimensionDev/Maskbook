import { Icons } from '@masknet/icons'
import { WalletMessages } from '@masknet/plugin-wallet'
import { SocialAccountList } from '@masknet/shared'
import { EMPTY_LIST, PluginID, type SocialAccount, type SocialIdentity } from '@masknet/shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { NextIDProof } from '@masknet/web3-providers'
import type { FC, HTMLProps } from 'react'
import { useAsync } from 'react-use'
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
        operations: {
            display: 'flex',
            alignItems: 'center',
            marginLeft: 'auto',
        },
        gearIcon: {
            marginLeft: theme.spacing(1),
            color: theme.palette.text.primary,
            cursor: 'pointer',
        },
        tipButton: {
            marginLeft: theme.spacing(1),
            width: 40,
            height: 40,
            borderRadius: 40,
            border: `1px solid ${theme.palette.maskColor.line}`,
        },
    }
})

export interface ProfileCardTitleProps extends HTMLProps<HTMLDivElement> {
    identity: SocialIdentity
    badgeBounding?: DOMRect
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
    badgeBounding,
    ...rest
}) => {
    const me = useLastRecognizedIdentity()
    const { classes, cx } = useStyles()
    const { setDialog } = useRemoteControlledDialog(WalletMessages.events.applicationDialogUpdated)
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

    const userId = identity.identifier?.userId
    const { value: nextIdBindings = EMPTY_LIST } = useAsync(async () => {
        if (!userId) return EMPTY_LIST
        return NextIDProof.queryProfilesByTwitterId(userId)
    }, [userId])

    return (
        <div className={cx(classes.title, className)} {...rest}>
            <ProfileBar
                className={classes.profileBar}
                identity={identity}
                badgeBounding={badgeBounding}
                socialAccounts={socialAccounts}
                address={address}
                onAddressChange={onAddressChange}>
                <div className={classes.operations}>
                    {nextIdBindings.length ? <SocialAccountList nextIdBindings={nextIdBindings} disablePortal /> : null}
                    {identity.identifier?.userId === me?.identifier?.userId ? (
                        <Icons.Gear className={classes.gearIcon} onClick={handleOpenDialog} />
                    ) : (
                        <TipButton className={classes.tipButton} receiver={identity.identifier} />
                    )}
                </div>
            </ProfileBar>
        </div>
    )
}
