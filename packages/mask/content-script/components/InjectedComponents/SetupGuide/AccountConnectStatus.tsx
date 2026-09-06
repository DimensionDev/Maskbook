import { Icons } from '@masknet/icons'
import { BindingDialog, LoadingStatus, SOCIAL_MEDIA_ROUND_ICON_MAPPING, type BindingDialogProps } from '@masknet/shared'
import { Sniffings, SOCIAL_MEDIA_NAME } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { memo } from 'react'
import { activatedSiteAdaptorUI } from '../../../site-adaptor-infra/ui.js'
import { SetupGuideContext } from './SetupGuideContext.js'
import { AccountConnectStatus as AccountConnectStatusUI } from '@masknet/injected-ui/AccountConnectStatus'
import { Trans } from '@lingui/react/macro'

const useStyles = makeStyles()((theme) => {
    return {
        main: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: theme.spacing(3),
            height: '100%',
            boxSizing: 'border-box',
        },
        icon: {
            marginTop: theme.spacing(3),
        },
        title: {
            fontSize: 18,
            margin: theme.spacing(1.5),
            fontWeight: 700,
        },
        loadingBox: {
            width: 320,
            height: 130,
            padding: theme.spacing(2),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
    }
})

function Frame({ children, ...rest }: BindingDialogProps) {
    const { classes } = useStyles()
    const site = activatedSiteAdaptorUI!.networkIdentifier
    const Icon = SOCIAL_MEDIA_ROUND_ICON_MAPPING[site] || Icons.Globe
    return (
        <BindingDialog {...rest}>
            <div className={classes.main}>
                <Icon size={48} className={classes.icon} />
                <Typography className={classes.title}>
                    <Trans>Connect Persona</Trans>
                </Typography>
                {children}
            </div>
        </BindingDialog>
    )
}

interface Props extends BindingDialogProps {
    currentUserId?: string
    expectAccount: string
    /** Loading current userId */
    loading?: boolean
}

export const AccountConnectStatus = memo<Props>(function AccountConnectStatus({
    expectAccount,
    currentUserId,
    loading,
    ...rest
}) {
    const { classes } = useStyles()
    const site = activatedSiteAdaptorUI!.networkIdentifier
    const siteName = SOCIAL_MEDIA_NAME[site] || ''

    const { connected, isFirstConnection } = SetupGuideContext.useContainer()

    if (loading)
        return (
            <Frame {...rest}>
                <div className={classes.loadingBox}>
                    <LoadingStatus omitText />
                </div>
            </Frame>
        )

    return (
        <Frame {...rest}>
            <AccountConnectStatusUI
                connected={connected}
                isFirstConnection={isFirstConnection}
                isTwitterPage={Sniffings.is_twitter_page}
                expectAccount={expectAccount}
                currentUserId={currentUserId}
                siteName={siteName}
                onDone={rest.onClose}
            />
        </Frame>
    )
})
