import { Icons } from '@masknet/icons'
import { SocialAccountList } from '@masknet/shared'
import {
    CrossIsolationMessages,
    EMPTY_LIST,
    PluginID,
    type SocialAccount,
    type SocialIdentity,
} from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useFireflyLensAccounts } from '@masknet/web3-hooks-base'
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
    CrossIsolationMessages.events.settingsDialogEvent.sendToLocal({
        open: true,
        targetTab: PluginID.Web3Profile,
    })
}

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

    const userId = identity.identifier?.userId
    const { value: nextIdBindings = EMPTY_LIST } = useAsync(async () => {
        if (!userId) return EMPTY_LIST
        return NextIDProof.queryProfilesByTwitterId(userId)
    }, [userId])
    const { value: lensAccounts = EMPTY_LIST } = useFireflyLensAccounts(userId)

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
                    {nextIdBindings.length ? (
                        <SocialAccountList nextIdBindings={nextIdBindings} lensAccounts={lensAccounts} disablePortal />
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
