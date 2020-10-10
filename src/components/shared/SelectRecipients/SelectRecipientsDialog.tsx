import * as React from 'react'
import Fuse from 'fuse.js'
import {
    List,
    ListItem,
    ListItemText,
    makeStyles,
    Typography,
    Button,
    IconButton,
    InputBase,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@material-ui/core'
import { useStylesExtends } from '../../custom-ui-helper'
import { useI18N } from '../../../utils/i18n-next-ui'
import { ProfileInList } from './ProfileInList'
import type { Profile } from '../../../database'
import { DialogDismissIconUI } from '../../InjectedComponents/DialogDismissIcon'
import ShadowRootDialog from '../../../utils/shadow-root/ShadowRootDialog'
import { useCapturedInput } from '../../../utils/hooks/useCapturedEvents'

const useStyles = makeStyles((theme) => ({
    content: {
        padding: '0 !important',
    },
    title: {
        marginLeft: 6,
    },
    input: { flex: 1, minWidth: '10em', marginLeft: 20, marginTop: theme.spacing(1) },
}))

export interface SelectRecipientsDialogUIProps
    extends withClasses<
        | KeysInferFromUseStyles<typeof useStyles>
        | 'dialog'
        | 'backdrop'
        | 'container'
        | 'paper'
        | 'header'
        | 'actions'
        | 'close'
        | 'button'
    > {
    open: boolean
    items: Profile[]
    selected: Profile[]
    disabled: boolean
    disabledItems?: Profile[]
    submitDisabled: boolean
    onSubmit: () => void
    onClose: () => void
    onSelect: (item: Profile) => void
    onDeselect: (item: Profile) => void
}
export function SelectRecipientsDialogUI(props: SelectRecipientsDialogUIProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)
    const { items, disabledItems } = props
    const [search, setSearch] = React.useState('')
    const [, inputRef] = useCapturedInput((newText) => {
        setSearch(newText)
    }, [])
    const itemsAfterSearch = React.useMemo(() => {
        const fuse = new Fuse(items, {
            keys: ['identifier.userId', 'linkedPersona.fingerprint', 'nickname'],
            isCaseSensitive: false,
            threshold: 0,
        })

        return search === '' ? items : fuse.search(search).map((item) => item.item)
    }, [search, items])
    const LIST_ITEM_HEIGHT = 56

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
            onEscapeKeyDown={props.onClose}
            BackdropProps={{
                className: classes.backdrop,
            }}>
            <DialogTitle className={classes.header}>
                <IconButton
                    classes={{ root: classes.close }}
                    aria-label={t('select_specific_friends_dialog__dismiss_aria')}
                    onClick={props.onClose}>
                    <DialogDismissIconUI />
                </IconButton>
                <Typography className={classes.title} display="inline" variant="inherit">
                    {t('select_specific_friends_dialog__title')}
                </Typography>
            </DialogTitle>
            <InputBase
                value={search}
                inputRef={inputRef}
                className={classes.input}
                placeholder={t('search_box_placeholder')}
            />
            <DialogContent className={classes.content}>
                <List style={{ height: items.length * LIST_ITEM_HEIGHT }} dense>
                    {itemsAfterSearch.length === 0 ? (
                        <ListItem>
                            <ListItemText primary={t('no_search_result')} />
                        </ListItem>
                    ) : (
                        itemsAfterSearch.map((item) => (
                            <ProfileInList
                                key={item.identifier.toText()}
                                item={item}
                                checked={
                                    props.selected.some((x) => x.identifier.equals(item.identifier)) ||
                                    disabledItems?.includes(item)
                                }
                                disabled={props.disabled || disabledItems?.includes(item)}
                                onChange={(_, checked) => {
                                    if (checked) {
                                        props.onSelect(item)
                                    } else {
                                        props.onDeselect(item)
                                    }
                                }}
                            />
                        ))
                    )}
                </List>
            </DialogContent>
            <DialogActions className={classes.actions}>
                <Button
                    className={classes.button}
                    style={{ marginLeft: 'auto' }}
                    variant="contained"
                    disabled={props.submitDisabled}
                    onClick={props.onSubmit}>
                    {t('select_specific_friends_dialog__button')}
                </Button>
            </DialogActions>
        </ShadowRootDialog>
    )
}
