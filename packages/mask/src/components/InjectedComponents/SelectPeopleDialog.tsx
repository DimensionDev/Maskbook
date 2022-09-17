import { useCallback, useState } from 'react'
import { ActionButton, makeStyles } from '@masknet/theme'
import { Button, DialogActions, DialogContent } from '@mui/material'
import { InjectedDialog } from '@masknet/shared'
import { useI18N } from '../../utils/index.js'
import { SelectProfileUI } from '../shared/SelectProfileUI/index.js'
import type { ProfileInformation as Profile } from '@masknet/shared-base'
import { uniqBy } from 'lodash-unified'

export interface SelectProfileDialogProps {
    open: boolean
    profiles: Profile[]
    alreadySelectedPreviously: Profile[]
    onClose: () => void
    onSelect: (people: Profile[]) => Promise<void>
}
const useStyles = makeStyles()({
    title: { paddingBottom: 0 },
    content: { padding: '0 12px' },
    progress: { marginRight: 6 },
})

export function SelectProfileDialog(props: SelectProfileDialogProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [people, select] = useState<Profile[]>([])
    const [committed, setCommitted] = useState(false)
    const onClose = useCallback(() => {
        props.onClose()
        setCommitted(false)
        select([])
    }, [props])
    const [rejection, onReject] = useState<Error>()
    const share = useCallback(() => {
        setCommitted(true)
        props
            .onSelect(uniqBy([...people, ...props.alreadySelectedPreviously], (x) => x.identifier))
            .then(onClose, onReject)
    }, [onClose, people, props.onSelect])

    const canCommit = committed || people.length === 0
    return (
        <InjectedDialog onClose={onClose} open={props.open} title={t('share_to')}>
            <DialogContent>
                <SelectProfileUI
                    frozenSelected={props.alreadySelectedPreviously}
                    disabled={committed}
                    items={props.profiles}
                    selected={people}
                    onSetSelected={select}
                />
            </DialogContent>
            {rejection && (
                <DialogContent className={classes.content}>
                    <>
                        Error: {rejection.message} {console.error(rejection)}
                    </>
                </DialogContent>
            )}
            <DialogActions>
                <Button size="large" onClick={onClose}>
                    {t('cancel')}
                </Button>
                <ActionButton loading={committed} size="large" color="inherit" disabled={canCommit} onClick={share}>
                    {t(committed ? 'sharing' : 'share')}
                </ActionButton>
            </DialogActions>
        </InjectedDialog>
    )
}
