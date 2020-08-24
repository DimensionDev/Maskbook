import React, { useState } from 'react'
import { useI18N } from '../../../utils/i18n-next-ui'
import {
    makeStyles,
    DialogTitle,
    IconButton,
    Typography,
    DialogContent,
    Theme,
    DialogProps,
    FormControl,
    Select,
    MenuItem,
    InputLabel,
    createStyles,
    DialogActions,
    Button,
    Divider,
} from '@material-ui/core'
import ShadowRootDialog from '../../../utils/jss/ShadowRootDialog'
import { DialogDismissIconUI } from '../../../components/InjectedComponents/DialogDismissIcon'
import { Currency, Platform, resolveCurrencyName, resolvePlatformName } from '../type'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { getActivatedUI } from '../../../social-network/ui'
import {
    useTwitterDialog,
    useTwitterButton,
    useTwitterCloseButton,
} from '../../../social-network-provider/twitter.com/utils/theme'
import { PortalShadowRoot } from '../../../utils/jss/ShadowRootPortal'
import { getEnumAsArray } from '../../../utils/enum'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        title: {
            marginLeft: 6,
        },
        form: {
            '& > *': {
                margin: theme.spacing(1, 0),
            },
        },
        menuPaper: {
            maxHeight: 300,
        },
    }),
)

interface SettingsDialogUIProps
    extends withClasses<
        | KeysInferFromUseStyles<typeof useStyles>
        | 'root'
        | 'dialog'
        | 'backdrop'
        | 'container'
        | 'paper'
        | 'header'
        | 'content'
        | 'actions'
        | 'close'
        | 'button'
    > {
    open: boolean
    theme?: Theme
    currencies: Currency[]
    currency: Currency
    platform: Platform
    onCurrencyChange?: (currency: Currency) => void
    onPlatformChange?: (platform: Platform) => void
    onClose?: () => void
    DialogProps?: Partial<DialogProps>
}

function SettingsDialogUI(props: SettingsDialogUIProps) {
    const { t } = useI18N()
    const { currency, platform, currencies } = props
    const classes = useStylesExtends(useStyles(), props)
    return (
        <div className={classes.root}>
            <ShadowRootDialog
                className={classes.dialog}
                classes={{
                    container: classes.container,
                    paper: classes.paper,
                }}
                open={props.open}
                scroll="body"
                fullWidth
                maxWidth="sm"
                disableAutoFocus
                disableEnforceFocus
                onEscapeKeyDown={props.onClose}
                onExit={props.onClose}
                BackdropProps={{
                    className: classes.backdrop,
                }}
                {...props.DialogProps}>
                <DialogTitle className={classes.header}>
                    <IconButton classes={{ root: classes.close }} onClick={props.onClose}>
                        <DialogDismissIconUI />
                    </IconButton>
                    <Typography className={classes.title} display="inline" variant="inherit">
                        {t('post_dialog__title')}
                    </Typography>
                </DialogTitle>
                <Divider />
                <DialogContent className={classes.content}>
                    <form className={classes.form}>
                        <FormControl variant="filled" fullWidth>
                            <InputLabel>Data Source</InputLabel>
                            <Select
                                fullWidth
                                value={platform}
                                onChange={(e) => props.onPlatformChange?.(e.target.value as Platform)}
                                MenuProps={{ container: props.DialogProps?.container ?? PortalShadowRoot }}>
                                {getEnumAsArray(Platform).map(({ key, value }) => (
                                    <MenuItem key={key} value={value}>
                                        {resolvePlatformName(value)}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl variant="filled" fullWidth>
                            <InputLabel>Currency</InputLabel>
                            <Select
                                fullWidth
                                value={currency.id}
                                onChange={(e) => {
                                    const target = currencies.find((x) => x.id === (e.target.value as string))
                                    if (target) props.onCurrencyChange?.(target)
                                }}
                                MenuProps={{
                                    container: props.DialogProps?.container ?? PortalShadowRoot,
                                    classes: { paper: classes.menuPaper },
                                }}>
                                {currencies.map((x) => (
                                    <MenuItem key={x.id} value={x.id}>
                                        {resolveCurrencyName(x)}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </form>
                </DialogContent>
                <DialogActions className={classes.actions}>
                    <Button
                        className={classes.button}
                        style={{ marginLeft: 'auto' }}
                        color="primary"
                        variant="contained"
                        onClick={props.onClose}>
                        {t('confirm')}
                    </Button>
                </DialogActions>
            </ShadowRootDialog>
        </div>
    )
}

export interface SettingsDialogProps extends SettingsDialogUIProps {}

export function SettingsDialog(props: SettingsDialogProps) {
    const ui = getActivatedUI()
    const twitterClasses = {
        ...useTwitterDialog(),
        ...useTwitterButton(),
        ...useTwitterCloseButton(),
    }
    return ui.internalName === 'twitter' ? (
        <SettingsDialogUI classes={twitterClasses} {...props} />
    ) : (
        <SettingsDialogUI {...props} />
    )
}
