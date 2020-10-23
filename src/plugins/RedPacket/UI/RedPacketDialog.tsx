import React, { useState, useCallback } from 'react'
import {
    makeStyles,
    DialogTitle,
    IconButton,
    DialogContent,
    Typography,
    DialogProps,
    Theme,
    ThemeProvider,
} from '@material-ui/core'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { DialogDismissIconUI } from '../../../components/InjectedComponents/DialogDismissIcon'
import AbstractTab, { AbstractTabProps } from '../../../extension/options-page/DashboardComponents/AbstractTab'
import type { RedPacketJSONPayload } from '../types'
import { getActivatedUI } from '../../../social-network/ui'
import ShadowRootDialog from '../../../utils/shadow-root/ShadowRootDialog'
import { RedPacketMetaKey } from '../constants'
import { useI18N } from '../../../utils/i18n-next-ui'
import { RedPacketForm } from './RedPacketForm'
import { RedPacketBacklogList } from './RedPacketList'
import { PortalShadowRoot } from '../../../utils/shadow-root/ShadowRootPortal'
import { useAccount } from '../../../web3/hooks/useAccount'
import Services from '../../../extension/service'

interface RedPacketDialogProps
    extends withClasses<
        | KeysInferFromUseStyles<typeof useStyles>
        | 'dialog'
        | 'backdrop'
        | 'container'
        | 'paper'
        | 'input'
        | 'header'
        | 'content'
        | 'actions'
        | 'close'
        | 'button'
        | 'label'
        | 'switch'
    > {
    open: boolean
    theme?: Theme
    onConfirm: (opt?: RedPacketJSONPayload | null) => void
    onDecline: () => void
    DialogProps?: Partial<DialogProps>
}

const defaultTheme = {}

const useStyles = makeStyles({
    MUIInputRoot: {
        minHeight: 108,
        flexDirection: 'column',
        padding: 10,
        boxSizing: 'border-box',
    },
    MUIInputInput: {
        fontSize: 18,
        minHeight: '8em',
    },
    title: {
        marginLeft: 6,
    },
    actions: {
        paddingLeft: 26,
    },
    container: {
        width: '100%',
    },
    paper: {
        width: '500px !important',
    },
})

export default function RedPacketDialog(props: RedPacketDialogProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const account = useAccount()
    const onCreateOrSelect = useCallback((payload: RedPacketJSONPayload) => {
        const ref = getActivatedUI().typedMessageMetadata
        const next = new Map(ref.value.entries())
        payload ? next.set(RedPacketMetaKey, payload) : next.delete(RedPacketMetaKey)
        ref.value = next
        props.onConfirm(payload)
        // storing the created red packet in DB, it helps retrieve red packet password later
        Services.Plugin.invokePlugin('maskbook.red_packet', 'discoverRedPacket', '', payload)
    }, [])

    const state = useState(0)
    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: t('plugin_red_packet_create_new'),
                children: (
                    <RedPacketForm
                        onCreate={onCreateOrSelect}
                        SelectMenuProps={{ container: props.DialogProps?.container ?? PortalShadowRoot }}
                    />
                ),
                p: 0,
            },
            {
                label: t('plugin_red_packet_select_existing'),
                children: <RedPacketBacklogList from={account} onSelect={onCreateOrSelect} />,
                p: 0,
            },
        ],
        state,
    }

    return (
        <ThemeProvider theme={props.theme ?? defaultTheme}>
            <ShadowRootDialog
                className={classes.dialog}
                classes={{ container: classes.container, paper: classes.paper }}
                open={props.open}
                scroll="paper"
                fullWidth
                maxWidth="sm"
                disableAutoFocus
                disableEnforceFocus
                BackdropProps={{ className: classes.backdrop }}
                {...props.DialogProps}>
                <DialogTitle className={classes.header}>
                    <IconButton classes={{ root: classes.close }} onClick={props.onDecline}>
                        <DialogDismissIconUI />
                    </IconButton>
                    <Typography className={classes.title} display="inline" variant="inherit">
                        {t('plugin_red_packet_display_name')}
                    </Typography>
                </DialogTitle>
                <DialogContent className={classes.content}>
                    <AbstractTab height={362} {...tabProps}></AbstractTab>
                </DialogContent>
            </ShadowRootDialog>
        </ThemeProvider>
    )
}
