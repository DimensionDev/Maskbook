import { useCallback, useState } from 'react'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { Button, CircularProgress, DialogActions, DialogContent } from '@mui/material'
import { useI18N } from '../../utils'
import { SelectProfileUI } from '../shared/SelectProfileUI'
import type { Profile } from '../../database'
import { InjectedDialog } from '../shared/InjectedDialog'

export interface SelectProfileDialogProps extends withClasses<never> {
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
    const classes = useStylesExtends(useStyles(), props)
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
        props.onSelect(people).then(onClose, onReject)
    }, [onClose, people, props])

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
                    Error: {rejection.message} {console.error(rejection)}
                </DialogContent>
            )}
            <DialogActions>
                <Button size="large" onClick={onClose}>
                    {t('cancel')}
                </Button>
                <Button size="large" color="inherit" disabled={canCommit} onClick={share}>
                    {committed && (
                        <CircularProgress aria-busy className={classes.progress} size={16} variant="indeterminate" />
                    )}
                    {t(committed ? 'sharing' : 'share')}
                </Button>
            </DialogActions>
        </InjectedDialog>
    )
}

export function useShareMenu(
    people: Profile[],
    onSelect: (people: Profile[]) => Promise<void>,
    alreadySelectedPreviously: Profile[],
    SelectPeopleDialogProps?: Partial<SelectProfileDialogProps>,
) {
    const [show, setShow] = useState(false)
    const showShare = useCallback(() => setShow(true), [])
    const hideShare = useCallback(() => setShow(false), [])

    return {
        showShare,
        ShareMenu: (
            <SelectProfileDialog
                alreadySelectedPreviously={alreadySelectedPreviously}
                profiles={people}
                open={show}
                onClose={hideShare}
                onSelect={onSelect}
                {...SelectPeopleDialogProps}
            />
        ),
    }
}
