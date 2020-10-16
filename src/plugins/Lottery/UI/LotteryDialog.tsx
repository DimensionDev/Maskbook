import React, { useState, useCallback } from 'react'
import {
    makeStyles,
    createStyles,
    DialogTitle,
    DialogContent,
    DialogProps,
    Typography,
    IconButton,
} from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'
import ShadowRootDialog from '../../../utils/shadow-root/ShadowRootDialog'
import { PortalShadowRoot } from '../../../utils/shadow-root/ShadowRootPortal'
import { DialogDismissIconUI } from '../../../components/InjectedComponents/DialogDismissIcon'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import AbstractTab, { AbstractTabProps } from '../../../extension/options-page/DashboardComponents/AbstractTab'
import { getActivatedUI } from '../../../social-network/ui'

import type { LotteryRecord, LotteryJSONPayload } from '../types'
import { LotteryMetaKey } from '../constants'
import { CreateLotteryForm } from './CreateLotteryForm'

//#region existing lottery
const useExistingLotteryStyles = makeStyles((theme) =>
    createStyles({
        wrapper: {
            display: 'flex',
            width: 400,
            flexDirection: 'column',
            overflow: 'auto',
            margin: `${theme.spacing(1)}px auto`,
        },
        hint: {
            padding: theme.spacing(0.5, 1),
            border: `1px solid ${theme.palette.background.default}`,
            borderRadius: theme.spacing(1),
            margin: 'auto',
            cursor: 'pointer',
        },
    }),
)
interface ExistingLotteryProps {
    onSelectExistingLottery(opt?: LotteryJSONPayload | null): void
    lotterys: LotteryRecord[]
}
function ExistingLotteryUI(props: LotteryDialogProps & ExistingLotteryProps) {
    /**
     * TODO: complete this function
     */
    return <div>to-do...</div>
}
//#endregion

const useStyles = makeStyles((theme) => {
    createStyles({
        title: {
            marginLeft: 6,
        },
        container: {
            width: '100%',
        },
    })
})

interface LotteryDialogProps
    extends withClasses<
        | KeysInferFromUseStyles<typeof useStyles>
        | 'dialog'
        | 'wrapper'
        | 'backdrop'
        | 'container'
        | 'close'
        | 'header'
        | 'content'
        | 'paper'
        | 'title'
        | 'label'
        | 'button'
    > {
    open: boolean
    onConfirm: (opt?: LotteryJSONPayload | null) => void
    onDecline: () => void
    DialogProps?: Partial<DialogProps>
}

export default function LotteryDialog(props: LotteryDialogProps) {
    const classes = useStylesExtends(useStyles(), props)
    const state = useState(0)
    const { t } = useI18N()

    const onCreateOrSelect = useCallback((payload: LotteryJSONPayload) => {
        const ref = getActivatedUI().typedMessageMetadata
        const next = new Map(ref.value.entries())
        payload ? next.set(LotteryMetaKey, payload) : next.delete(LotteryMetaKey)
        ref.value = next
        props.onConfirm(payload)
    }, [])

    const insertLottery = (payload?: LotteryJSONPayload | null) => {
        const ref = getActivatedUI().typedMessageMetadata
        const next = new Map(ref.value.entries())
        payload ? next.set('lottery', payload) : next.delete('lottery')
        ref.value = next
        props.onConfirm(payload)
    }

    const [availableLotterys, setAvailableLotterys] = useState<LotteryRecord[]>([])

    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: t('plugin_lottery_create_new'),
                children: (
                    <CreateLotteryForm
                        onCreate={onCreateOrSelect}
                        SelectMenuProps={{ container: props.DialogProps?.container ?? PortalShadowRoot }}
                    />
                ),
                p: 0,
            },
            {
                label: t('plugin_lottery_select_existing'),
                children: (
                    <ExistingLotteryUI
                        {...props}
                        lotterys={availableLotterys}
                        onSelectExistingLottery={insertLottery}
                    />
                ),
                p: 0,
            },
        ],
        state,
    }

    return (
        <ShadowRootDialog
            className={classes.dialog}
            classes={{
                container: classes.container,
                paper: classes.paper,
            }}
            open={props.open}
            scroll="paper"
            fullWidth
            maxWidth="sm"
            disableAutoFocus
            disableEnforceFocus
            BackdropProps={{
                className: classes.backdrop,
            }}
            {...props.DialogProps}>
            <DialogTitle className={classes.header}>
                <IconButton classes={{ root: classes.close }} onClick={props.onDecline}>
                    <DialogDismissIconUI />
                </IconButton>
                <Typography className={classes.title} display="inline" variant="inherit">
                    {t('plugin_lottery_display_name')}
                </Typography>
            </DialogTitle>
            <DialogContent className={classes.content}>
                <AbstractTab height={450} {...tabProps}></AbstractTab>
            </DialogContent>
        </ShadowRootDialog>
    )
}
