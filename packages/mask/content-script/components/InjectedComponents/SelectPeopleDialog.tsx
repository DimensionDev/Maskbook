import { useCallback, useEffect, useMemo, useState } from 'react'
import { ActionButton, makeStyles } from '@masknet/theme'
import { Button, DialogActions, DialogContent, alpha } from '@mui/material'
import { InjectedDialog } from '@masknet/shared'
import { EMPTY_LIST, type ProfileInformation as Profile } from '@masknet/shared-base'
import { uniqBy } from 'lodash-es'
import { useCurrentIdentity } from '../DataSource/useActivatedUI.js'
import { useRecipientsList } from '../CompositionDialog/useRecipientsList.js'
import { SelectProfileUI } from '../shared/SelectProfileUI/index.js'
import { Telemetry } from '@masknet/web3-telemetry'
import { EventType, EventID } from '@masknet/web3-telemetry/types'
import { Trans } from '@lingui/react/macro'

interface SelectProfileDialogProps {
    open: boolean
    profiles: Profile[]
    selectedProfiles: Profile[]
    onClose: () => void
    onSelect: (people: Profile[]) => Promise<void>
}
const useStyles = makeStyles()((theme) => ({
    content: { padding: '0 12px' },
    body: {
        '::-webkit-scrollbar': {
            display: 'none',
        },
        padding: theme.spacing(2),
        height: 450,
    },
    action: {
        display: 'flex',
        gap: 16,
        padding: 16,
        boxSizing: 'border-box',
        alignItems: 'center',
        background: alpha(theme.palette.maskColor.bottom, 0.8),
        boxShadow:
            theme.palette.mode === 'light' ?
                ' 0px 0px 20px rgba(0, 0, 0, 0.05)'
            :   '0px 0px 20px rgba(255, 255, 255, 0.12);',
        borderRadius: '0px 0px 12px 12px',
        flex: 1,
        backdropFilter: 'blur(8px)',
    },

    cancel: {
        color: theme.palette.maskColor.main,
        background: theme.palette.maskColor.thirdMain,
        fontSize: 14,
        fontWeight: 700,
        lineHeight: '18px',
        height: 40,
        '&:hover': {
            color: theme.palette.maskColor.main,
            background: theme.palette.maskColor.thirdMain,
        },
    },
    share: {
        color: theme.palette.maskColor.bottom,
        background: theme.palette.maskColor.main,
        fontSize: 14,
        fontWeight: 700,
        lineHeight: '18px',
        height: 40,
    },
}))

export function SelectProfileDialog({ open, profiles, selectedProfiles, onClose, onSelect }: SelectProfileDialogProps) {
    const { classes } = useStyles()
    const [people, select] = useState<Profile[]>([])
    const [committed, setCommitted] = useState(false)
    const handleClose = useCallback(() => {
        onClose()
        setCommitted(false)
        select([])
    }, [onClose])

    const recipientsList = useRecipientsList()
    const [rejection, onReject] = useState<Error>()
    const share = useCallback(() => {
        setCommitted(true)
        onSelect(uniqBy([...people, ...selectedProfiles], (x) => x.identifier)).then(handleClose, (err: unknown) => {
            console.warn(err)
            onReject(new Error('Failed to share with selected people.', { cause: err }))
        })
    }, [handleClose, people, selectedProfiles, onSelect])

    const currentIdentity = useCurrentIdentity()
    const myUserId = currentIdentity?.identifier.userId
    const searchedList = useMemo(() => {
        if (!recipientsList?.recipients) return EMPTY_LIST
        const profileItems = recipientsList.recipients.filter((x) => x.identifier.userId !== myUserId)
        return uniqBy(profileItems.concat(profiles), ({ linkedPersona }) => linkedPersona?.rawPublicKey)
    }, [profiles, recipientsList.recipients, myUserId])

    useEffect(() => {
        if (!open) return
        recipientsList.request()
    }, [open, recipientsList.request])

    useEffect(() => {
        if (!open) return
        Telemetry.captureEvent(EventType.Access, EventID.EntryMaskComposeVisibleSelected)
    }, [open])

    const canCommit = committed || people.length === 0

    return (
        <InjectedDialog onClose={handleClose} open={open} title={<Trans>Share with</Trans>}>
            <DialogContent className={classes.body}>
                <SelectProfileUI
                    frozenSelected={selectedProfiles}
                    disabled={committed}
                    items={searchedList}
                    selected={people}
                    onSetSelected={select}
                    onSearch={() => {}}
                    loading={false}
                />
            </DialogContent>
            {rejection ?
                <DialogContent className={classes.content}>
                    <Trans>Error: {rejection.message}</Trans>
                </DialogContent>
            :   null}
            <DialogActions className={classes.action}>
                <Button className={classes.cancel} fullWidth onClick={handleClose} variant="roundedContained">
                    <Trans>Cancel</Trans>
                </Button>
                <ActionButton
                    fullWidth
                    variant="roundedContained"
                    loading={committed}
                    className={classes.share}
                    disabled={canCommit}
                    onClick={share}>
                    <Trans>Done</Trans>
                </ActionButton>
            </DialogActions>
        </InjectedDialog>
    )
}
