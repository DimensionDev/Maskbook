import { Icons } from '@masknet/icons'
import { SocialAccountList } from '@masknet/shared'
import { CrossIsolationMessages, EMPTY_LIST, type SocialAccount, type SocialIdentity } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { NextIDProof } from '@masknet/web3-providers'
import { useQuery } from '@tanstack/react-query'
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

    const userId = identity.identifier?.userId
    const itsMe = identity.identifier?.userId === me.identifier?.userId
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
                        <Icons.Gear className={classes.gearIcon} onClick={openWeb3ProfileSettingDialog} />
                    ) : (
                        <TipButton className={classes.tipButton} receiver={identity.identifier} />
                    )}
                </div>
            </ProfileBar>
        </div>
    )
}
