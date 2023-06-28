import type { HTMLProps } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Icons } from '@masknet/icons'
import { SocialAccountList, useCurrentPersonaConnectStatus, useRemoteControlledDialog } from '@masknet/shared'
import {
    CrossIsolationMessages,
    EMPTY_LIST,
    PluginID,
    type SocialAccount,
    type SocialIdentity,
} from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { NextIDProof } from '@masknet/web3-providers'
import { TipButton } from '../../../plugins/Tips/components/index.js'
import { useLastRecognizedIdentity } from '../../DataSource/useActivatedUI.js'
import { useCurrentPersona } from '../../DataSource/usePersonaConnectStatus.js'
import { ProfileBar } from './ProfileBar.js'
import { usePersonasFromDB } from '../../DataSource/usePersonasFromDB.js'

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
        persona?.identifier.toText(),
        undefined,
        identity,
    )

    const { setDialog: setPersonaSelectPanelDialog } = useRemoteControlledDialog(
        CrossIsolationMessages.events.PersonaSelectPanelDialogUpdated,
    )

    if (loading) return null

    return (
        <Icons.Gear
            className={classes.gearIcon}
            onClick={() => {
                if (status.connected && status.verified) {
                    openWeb3ProfileSettingDialog()
                } else {
                    setPersonaSelectPanelDialog({
                        open: true,
                        enableVerify: !status.verified,
                        target: PluginID.Web3Profile,
                    })
                }
            }}
        />
    )
}

export interface ProfileCardTitleProps extends HTMLProps<HTMLDivElement> {
    identity: SocialIdentity
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

    const userId = identity.identifier?.userId
    const itsMe = identity.identifier?.userId === me?.identifier?.userId
    const { data: nextIdBindings = EMPTY_LIST } = useQuery({
        queryKey: ['next-id', 'profiles-by-twitter-id', userId],
        enabled: !!userId,
        queryFn: async () => {
            if (!userId) return EMPTY_LIST
            return NextIDProof.queryProfilesByTwitterId(userId)
        },
    })

    return (
        <div className={cx(classes.title, className)} {...rest}>
            <ProfileBar
                className={classes.profileBar}
                identity={identity}
                socialAccounts={socialAccounts}
                address={address}
                onAddressChange={onAddressChange}>
                <div className={classes.operations}>
                    {nextIdBindings.length ? (
                        <SocialAccountList
                            nextIdBindings={nextIdBindings}
                            userId={userId}
                            disablePortal
                            anchorPosition={{
                                top: 50,
                                left: itsMe ? 390 : 370,
                            }}
                            anchorReference="anchorPosition"
                        />
                    ) : null}
                    {itsMe ? (
                        <Web3ProfileSettingButton />
                    ) : (
                        <TipButton className={classes.tipButton} receiver={identity.identifier} />
                    )}
                </div>
            </ProfileBar>
        </div>
    )
}
