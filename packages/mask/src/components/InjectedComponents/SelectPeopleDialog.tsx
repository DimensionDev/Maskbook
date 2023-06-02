import { useCallback, useState } from 'react'
import { ActionButton, makeStyles } from '@masknet/theme'
import { Button, DialogActions, DialogContent, alpha } from '@mui/material'
import { InjectedDialog } from '@masknet/shared'
import { useI18N } from '../../utils/index.js'
import { SelectProfileUI } from '../shared/SelectProfileUI/index.js'
import type { ProfileInformation as Profile } from '@masknet/shared-base'
import { uniqBy } from 'lodash-es'

export interface SelectProfileDialogProps {
    open: boolean
    profiles: Profile[]
    alreadySelectedPreviously: Profile[]
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
    },
    action: {
        display: 'flex',
        gap: 16,
        padding: 16,
        boxSizing: 'border-box',
        alignItems: 'center',
        background: alpha(theme.palette.maskColor.bottom, 0.8),
        boxShadow:
            theme.palette.mode === 'light'
                ? ' 0px 0px 20px rgba(0, 0, 0, 0.05)'
                : '0px 0px 20px rgba(255, 255, 255, 0.12);',
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
            <DialogContent className={classes.body}>
                <SelectProfileUI
                    frozenSelected={props.alreadySelectedPreviously}
                    disabled={committed}
                    items={props.profiles}
                    selected={people}
                    onSetSelected={select}
                />
            </DialogContent>
            {rejection ? (
                <DialogContent className={classes.content}>
                    <>
                        Error: {rejection.message} {console.error(rejection)}
                    </>
                </DialogContent>
            ) : null}
            <DialogActions className={classes.action}>
                <Button className={classes.cancel} fullWidth onClick={onClose} variant="roundedContained">
                    {t('cancel')}
                </Button>
                <ActionButton
                    fullWidth
                    variant="roundedContained"
                    loading={committed}
                    className={classes.share}
                    disabled={canCommit}
                    onClick={share}>
                    {t(committed ? 'sharing' : 'share')}
                </ActionButton>
            </DialogActions>
        </InjectedDialog>
    )
}
