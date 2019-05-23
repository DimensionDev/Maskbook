import React, { useState, useCallback } from 'react'
import { SelectPeopleUI } from './SelectPeople'
import Dialog from '@material-ui/core/Dialog/Dialog'
import { Person } from '../../extension/background-script/PeopleService'
import CircularProgress from '@material-ui/core/CircularProgress/CircularProgress'
import Button from '@material-ui/core/Button/Button'
import DialogTitle from '@material-ui/core/DialogTitle/DialogTitle'
import DialogActions from '@material-ui/core/DialogActions/DialogActions'
import DialogContent from '@material-ui/core/DialogContent/DialogContent'
import { withStylesTyped } from '../../utils/theme'
import { geti18nString } from '../../utils/i18n'
interface Props {
    open: boolean
    people: Person[]
    alreadySelectedPreviously: Person[]
    onClose(): void
    onSelect(people: Person[]): Promise<void>
}
export const SelectPeopleDialog = withStylesTyped({
    title: { paddingBottom: 0 },
    content: { padding: '0 12px' },
    progress: { marginRight: 6 },
})<Props>(({ classes, ...props }) => {
    const [people, select] = useState<Person[]>([] as Person[])
    const [committed, setCommitted] = useState(false)
    const onClose = useCallback(() => {
        props.onClose()
        setCommitted(false)
        select([])
    }, [props.onClose])
    const [rejection, onReject] = useState<Error>()
    const share = useCallback(() => {
        setCommitted(true)
        props.onSelect(people).then(onClose, onReject)
    }, [people])

    const canClose = !rejection && committed
    const canCommit = committed || people.length === 0
    return (
        <Dialog onClose={canClose ? onClose : void 0} open={props.open} scroll="paper" fullWidth maxWidth="sm">
            <DialogTitle className={classes.title}>Share to ...</DialogTitle>
            <DialogContent className={classes.content}>
                <SelectPeopleUI
                    frozenSelected={props.alreadySelectedPreviously}
                    disabled={committed}
                    people={props.people}
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
                <Button size="large" disabled={canClose} onClick={onClose}>
                    {geti18nString('cancel')}
                </Button>
                <Button size="large" disabled={canCommit} color="primary" onClick={share}>
                    {committed && (
                        <CircularProgress aria-busy className={classes.progress} size={16} variant="indeterminate" />
                    )}
                    {geti18nString(committed ? 'sharing' : 'share')}
                </Button>
            </DialogActions>
        </Dialog>
    )
})

export function useShareMenu(
    people: Person[],
    onSelect: (people: Person[]) => Promise<void>,
    alreadySelectedPreviously: Person[],
) {
    const [show, setShow] = useState(false)
    const showShare = useCallback(() => setShow(true), [])
    const hideShare = useCallback(() => setShow(false), [])

    return {
        showShare,
        // hideShare,
        ShareMenu: (
            <SelectPeopleDialog
                alreadySelectedPreviously={alreadySelectedPreviously}
                people={people}
                open={show}
                onClose={hideShare}
                onSelect={onSelect}
            />
        ),
    }
}
