import React, { useState, useCallback } from 'react'
import { useEsc } from '../Welcomes/useEsc'
import { SelectPeopleUI } from './SelectPeople'
import Dialog from '@material-ui/core/Dialog/Dialog'
import { usePeople } from '../DataSource/PeopleRef'
import { Person } from '../../extension/background-script/PeopleService'
import CircularProgress from '@material-ui/core/CircularProgress/CircularProgress'
import Button from '@material-ui/core/Button/Button'
import DialogTitle from '@material-ui/core/DialogTitle/DialogTitle'
import DialogActions from '@material-ui/core/DialogActions/DialogActions'
import DialogContent from '@material-ui/core/DialogContent/DialogContent'
interface Props {
    open: boolean
    people: Person[]
    onClose(): void
    onSelect(people: Person[]): Promise<void>
}
export function SelectPeopleDialog(props: Props) {
    const [people, select] = useState<Person[]>([] as Person[])
    const [committed, setCommitted] = useState(false)
    const share = useCallback(() => {
        setCommitted(true)
        // TODO: On rejected
        props.onSelect(people).then(props.onClose)
    }, [people])
    useEsc(() => (committed ? void 0 : props.onClose()))
    return (
        <Dialog open={props.open} scroll="paper" fullWidth maxWidth="sm">
            <DialogTitle style={{ paddingBottom: 0 }}>Share to ...</DialogTitle>
            <DialogContent style={{ padding: '0 12px' }}>
                <SelectPeopleUI
                    disabled={committed}
                    borderless
                    all={props.people}
                    selected={people}
                    onSetSelected={select}
                />
            </DialogContent>
            <DialogActions>
                <Button size="large" disabled={committed || people.length === 0} color="primary" onClick={share}>
                    {committed && <CircularProgress style={{ marginRight: 6 }} size={16} variant="indeterminate" />}
                    {committed ? 'Sharing' : 'Share'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export function useShareMenu(people: Person[], onSelect: (people: Person[]) => Promise<void>) {
    const [show, setShow] = useState(false)
    const showShare = useCallback(() => setShow(true), [])
    const hideShare = useCallback(() => setShow(false), [])
    return {
        showShare,
        hideShare,
        ShareMenu: <SelectPeopleDialog people={people} open={show} onClose={hideShare} onSelect={onSelect} />,
    }
}
