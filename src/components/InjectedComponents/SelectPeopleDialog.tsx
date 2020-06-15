import React, { useCallback, useState } from 'react'
import { SelectPeopleAndGroupsUI, SelectPeopleAndGroupsUIProps } from '../shared/SelectPeopleAndGroups'
import { useI18N } from '../../utils/i18n-next-ui'
import { makeStyles } from '@material-ui/core/styles'
import { Button, CircularProgress, DialogActions, DialogContent, DialogTitle } from '@material-ui/core'
import type { Profile } from '../../database'
import { useStylesExtends } from '../custom-ui-helper'
import ShadowRootDialog from '../../utils/jss/ShadowRootDialog'

export interface SelectPeopleDialogProps
    extends withClasses<KeysInferFromUseStyles<typeof useStyles, 'content'> | 'button'> {
    open: boolean
    people: Profile[]
    alreadySelectedPreviously: Profile[]
    onClose: () => void
    onSelect: (people: Profile[]) => Promise<void>
    SelectPeopleAndGroupsUIProps?: SelectPeopleAndGroupsUIProps<Profile>
}
const useStyles = makeStyles({
    title: { paddingBottom: 0 },
    content: { padding: '0 12px' },
    progress: { marginRight: 6 },
})

export function SelectPeopleDialog(props: SelectPeopleDialogProps) {
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

    const canClose = !rejection && committed
    const canCommit = committed || people.length === 0
    return (
        <ShadowRootDialog
            disableEnforceFocus
            onClose={canClose ? onClose : void 0}
            open={props.open}
            scroll="paper"
            fullWidth
            maxWidth="sm">
            <DialogTitle className={classes.title}>{t('share_to')}</DialogTitle>
            <DialogContent className={classes.content}>
                <SelectPeopleAndGroupsUI<Profile>
                    frozenSelected={props.alreadySelectedPreviously}
                    disabled={committed}
                    items={props.people}
                    selected={people}
                    onSetSelected={select}
                    {...props.SelectPeopleAndGroupsUIProps}
                />
            </DialogContent>
            {rejection && (
                <DialogContent className={classes.content}>
                    Error: {rejection.message} {console.error(rejection)}
                </DialogContent>
            )}
            <DialogActions>
                <Button className={classes.button} size="large" disabled={canClose} onClick={onClose}>
                    {t('cancel')}
                </Button>
                <Button className={classes.button} size="large" disabled={canCommit} color="primary" onClick={share}>
                    {committed && (
                        <CircularProgress aria-busy className={classes.progress} size={16} variant="indeterminate" />
                    )}
                    {t(committed ? 'sharing' : 'share')}
                </Button>
            </DialogActions>
        </ShadowRootDialog>
    )
}

export function useShareMenu(
    people: Profile[],
    onSelect: (people: Profile[]) => Promise<void>,
    alreadySelectedPreviously: Profile[],
    SelectPeopleDialogProps?: Partial<SelectPeopleDialogProps>,
) {
    const [show, setShow] = useState(false)
    const showShare = useCallback(() => setShow(true), [])
    const hideShare = useCallback(() => setShow(false), [])

    return {
        showShare,
        ShareMenu: (
            <SelectPeopleDialog
                alreadySelectedPreviously={alreadySelectedPreviously}
                people={people}
                open={show}
                onClose={hideShare}
                onSelect={onSelect}
                {...SelectPeopleDialogProps}
            />
        ),
    }
}
