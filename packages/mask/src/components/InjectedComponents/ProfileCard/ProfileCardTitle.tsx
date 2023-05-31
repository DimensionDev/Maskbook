import { Icons } from '@masknet/icons'
import { SocialAccountList } from '@masknet/shared'
import { CrossIsolationMessages, EMPTY_LIST, type SocialAccount, type SocialIdentity } from '@masknet/shared-base'
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
    const { value: nextIdBindings = EMPTY_LIST } = useAsync(async () => {
        if (!socialAccounts[0].label) return EMPTY_LIST
        return NextIDProof.queryProfilesByDomain(socialAccounts[0].label)
    }, [socialAccounts[0].label])

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
                        <SocialAccountList nextIdBindings={nextIdBindings} userId={userId} disablePortal />
                    ) : null}
                    {identity.identifier?.userId === me?.identifier?.userId ? (
                        <Icons.Gear className={classes.gearIcon} onClick={openWeb3ProfileSettingDialog} />
                    ) : (
                        <TipButton className={classes.tipButton} receiver={identity.identifier} />
                    )}
                </div>
            </ProfileBar>
        </div>
    )
}
