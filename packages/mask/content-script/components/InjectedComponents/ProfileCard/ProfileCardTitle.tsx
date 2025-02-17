import { Icons } from '@masknet/icons'
import { useIsMinimalMode } from '@masknet/plugin-infra/content-script'
import { TipButton } from '@masknet/plugin-tips'
import { PersonaSelectPanelModal, SocialAccountList, useCurrentPersonaConnectStatus } from '@masknet/shared'
import {
    CrossIsolationMessages,
    EMPTY_LIST,
    PluginID,
    type SocialAccount,
    type SocialIdentity,
} from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { Web3Bio } from '@masknet/web3-providers'
import { useQuery } from '@tanstack/react-query'
import type { HTMLProps } from 'react'
import { useLastRecognizedIdentity } from '../../DataSource/useActivatedUI.js'
import { useCurrentPersona, usePersonasFromDB } from '../../../../shared-ui/hooks/index.js'
import { ProfileBar, ProfileBarSkeleton } from './ProfileBar.js'

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

function openWeb3ProfileSettingDialog() {
    CrossIsolationMessages.events.web3ProfileDialogEvent.sendToLocal({
        open: true,
    })
}

function Web3ProfileSettingButton() {
    const { classes } = useStyles()

    const personas = usePersonasFromDB()
    const persona = useCurrentPersona()
    const identity = useLastRecognizedIdentity()
    const { value: status, loading } = useCurrentPersonaConnectStatus(
        personas,
        persona?.identifier,
        undefined,
        identity,
    )

    if (loading) return null

    return (
        <Icons.Gear
            className={classes.gearIcon}
            onClick={() => {
                if (status.connected && status.verified) {
                    openWeb3ProfileSettingDialog()
                } else {
                    PersonaSelectPanelModal.open({
                        enableVerify: !status.verified,
                        finishTarget: PluginID.Web3Profile,
                    })
                }
            }}
        />
    )
}

interface ProfileCardTitleProps extends HTMLProps<HTMLDivElement> {
    identity?: SocialIdentity
    socialAccounts: Array<SocialAccount<Web3Helper.ChainIdAll>>
    address?: string
    onAddressChange?(address: string): void
}
export function ProfileCardTitle({
    className,
    socialAccounts,
    address,
    identity,
    onAddressChange,
    ...rest
}: ProfileCardTitleProps) {
    const me = useLastRecognizedIdentity()
    const { classes, cx } = useStyles()

    const userId = identity?.identifier?.userId
    const itsMe = !!userId && userId === me?.identifier?.userId
    const { data: web3bioProfiles = EMPTY_LIST } = useQuery({
        queryKey: ['web3bio', 'profiles-by-twitter-id', userId],
        enabled: !!userId,
        queryFn: async () => {
            if (!userId) return EMPTY_LIST
            return Web3Bio.getProfilesByTwitterId(userId)
        },
    })
    const tipsDisabled = useIsMinimalMode(PluginID.Tips)

    if (!identity)
        return (
            <div className={cx(classes.title, className)} {...rest}>
                <ProfileBarSkeleton className={classes.profileBar} socialAccounts={socialAccounts} address={address} />
            </div>
        )

    return (
        <div className={cx(classes.title, className)} {...rest}>
            <ProfileBar
                className={classes.profileBar}
                identity={identity}
                socialAccounts={socialAccounts}
                address={address}
                onAddressChange={onAddressChange}>
                <div className={classes.operations}>
                    {web3bioProfiles.length ?
                        <SocialAccountList
                            web3bioProfiles={web3bioProfiles}
                            userId={userId}
                            disablePortal
                            anchorPosition={{
                                top: 50,
                                left: itsMe ? 490 : 470,
                            }}
                            anchorReference="anchorPosition"
                        />
                    :   null}
                    {itsMe ?
                        <Web3ProfileSettingButton />
                    : !tipsDisabled ?
                        <TipButton className={classes.tipButton} receiver={identity.identifier} />
                    :   null}
                </div>
            </ProfileBar>
        </div>
    )
}
