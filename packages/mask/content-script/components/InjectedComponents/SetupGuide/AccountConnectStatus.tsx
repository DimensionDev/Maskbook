import { Icons } from '@masknet/icons'
import { BindingDialog, LoadingStatus, SOCIAL_MEDIA_ROUND_ICON_MAPPING, type BindingDialogProps } from '@masknet/shared'
import { SOCIAL_MEDIA_NAME } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { Box, Button, Typography } from '@mui/material'
import { memo } from 'react'
import { activatedSiteAdaptorUI } from '../../../site-adaptor-infra/ui.js'
import { MaskSharedTrans } from '../../../../shared-ui/index.js'
import { SetupGuideContext } from './SetupGuideContext.js'
import { Trans } from '@lingui/macro'

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
        text: {
            fontSize: 16,
            textAlign: 'center',
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

    const { connected } = SetupGuideContext.useContainer()

    if (loading)
        return (
            <Frame {...rest}>
                <div className={classes.loadingBox}>
                    <LoadingStatus omitText />
                </div>
            </Frame>
        )

    if (connected)
        return (
            <Frame {...rest}>
                <Typography className={classes.text}>
                    {/* eslint-disable-next-line react/naming-convention/component-name */}
                    <MaskSharedTrans.connected_already
                        values={{
                            account: currentUserId!,
                        }}
                        components={{
                            bold: <b />,
                        }}
                    />
                </Typography>
                <Typography className={classes.text} mt="1.5em">
                    <Trans>Change another account and try again.</Trans>
                </Typography>
                <Box mt="auto" width="100%">
                    <Button fullWidth onClick={rest.onClose}>
                        <Trans>Done</Trans>
                    </Button>
                </Box>
            </Frame>
        )

    if (currentUserId)
        return (
            <Frame {...rest}>
                <Typography className={classes.text}>
                    <Trans>Current account is not the verifying account.</Trans>
                </Typography>
                <Typography className={classes.text} mt="1.5em">
                    {/* eslint-disable-next-line react/naming-convention/component-name */}
                    <MaskSharedTrans.request_to_switch_account
                        values={{
                            account: expectAccount,
                        }}
                        components={{
                            bold: <b />,
                        }}
                    />
                </Typography>
            </Frame>
        )

    return (
        <Frame {...rest}>
            <Typography className={classes.text}>
                <Trans>Please sign up or login {siteName} to connect Mask Network.</Trans>
            </Typography>
        </Frame>
    )
})
