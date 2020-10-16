import React, { useState, useEffect } from 'react'
import ShadowRootDialog from '../../../../utils/shadow-root/ShadowRootDialog'
import { PortalShadowRoot } from '../../../../utils/shadow-root/ShadowRootPortal'
import {
    makeStyles,
    Button,
    InputLabel,
    FormControl,
    Select,
    MenuItem,
    ThemeProvider,
    DialogProps,
    DialogTitle,
    DialogContent,
    Typography,
    IconButton,
} from '@material-ui/core'
import { DialogDismissIconUI } from '../../../../components/InjectedComponents/DialogDismissIcon'
import { useStylesExtends } from '../../../../components/custom-ui-helper'
import { useI18N } from '../../../../utils/i18n-next-ui'
import { getActivatedUI } from '../../../../social-network/ui'

/***
 * TO-DO: move to public shared UI components
 * */
const useStyles = makeStyles((theme) => {
    const network = getActivatedUI()?.networkIdentifier
    return {
        timeLabel: {
            marginTop: theme.spacing(1),
            marginBottom: theme.spacing(1),
            width: '100%',
            boxSizing: 'border-box',
            border: `1px solid ${theme.palette.divider}`,
            alignItems: 'center',
            textAlign: 'center',
            padding: theme.spacing(2),
            ...(network === 'twitter.com'
                ? {
                      borderRadius: 15,
                      overflow: 'hidden',
                  }
                : null),
        },
        container: {
            margin: theme.spacing(1),
            padding: theme.spacing(1),
        },
        formControl: {
            margin: theme.spacing(1),
            minWidth: 120,
        },
        header: {
            borderBottom: '1px solid #ccd6dd',
            display: 'flex',
            padding: '10px 15px',
        },
        title: {
            textAlign: 'center',
            margin: theme.spacing(1),
        },
    }
})

interface TimePickerFormProp
    extends withClasses<
        | KeysInferFromUseStyles<typeof useStyles>
        | 'dialog'
        | 'container'
        | 'close'
        | 'header'
        | 'content'
        | 'paper'
        | 'title'
    > {
    label?: string
    callback: (ts: number) => void
    DialogProps?: Partial<DialogProps>
}

export function TimePickerForm(props: TimePickerFormProp) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)
    const theme = getActivatedUI().useTheme()
    const { label, callback } = props
    const [open, setOpen] = useState(false)

    const [days, setDays] = useState(1)
    const [hours, setHours] = useState(0)
    const [minutes, setMinutes] = useState(0)
    const secs = days * 3600 * 24 + hours * 3600 + minutes * 60

    useEffect(() => {
        callback(secs)
    })

    const handleClickOpen = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
    }

    const renderSelect = (count: number, fn: (newVal: number) => void, defaultIndex = 0) => {
        const options = new Array(count).fill('')
        return (
            <Select
                MenuProps={{ container: PortalShadowRoot }}
                value={defaultIndex}
                onChange={(e) => fn(e.target.value as number)}>
                {options.map((item, index) => (
                    <MenuItem value={index} key={index}>
                        {index}
                    </MenuItem>
                ))}
            </Select>
        )
    }

    return (
        <ThemeProvider theme={theme}>
            <Button className={classes.timeLabel} onClick={handleClickOpen}>
                {t('plugin_lottery_decription_timepicker', { label, days, hours, minutes })}
            </Button>
            <ShadowRootDialog
                className={classes.dialog}
                classes={{
                    container: classes.container,
                    paper: classes.paper,
                }}
                open={open}
                scroll="paper"
                fullWidth
                maxWidth="sm"
                disableAutoFocus
                disableEnforceFocus
                {...props.DialogProps}>
                <div className={classes.container}>
                    <DialogTitle className={classes.header}>
                        <IconButton classes={{ root: classes.close }} onClick={handleClose}>
                            <DialogDismissIconUI />
                        </IconButton>
                        <Typography className={classes.title} display="inline" variant="inherit">
                            {label} {t('plugin_lottery_timepicker_hint')}
                        </Typography>
                    </DialogTitle>
                    <DialogContent className={classes.content}>
                        <form className={classes.container}>
                            <FormControl className={classes.formControl}>
                                <InputLabel>{t('plugin_lottery_timepicker_days')}</InputLabel>
                                {renderSelect(32, setDays, days)}
                            </FormControl>
                            <FormControl className={classes.formControl}>
                                <InputLabel>{t('plugin_lottery_timepicker_hours')}</InputLabel>
                                {renderSelect(25, setHours, hours)}
                            </FormControl>
                            <FormControl className={classes.formControl}>
                                <InputLabel>{t('plugin_lottery_timepicker_minutes')}</InputLabel>
                                {renderSelect(61, setMinutes, minutes)}
                            </FormControl>
                        </form>
                    </DialogContent>
                </div>
            </ShadowRootDialog>
        </ThemeProvider>
    )
}
