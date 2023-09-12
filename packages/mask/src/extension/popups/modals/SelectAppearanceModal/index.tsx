import { makeStyles } from '@masknet/theme'
import { memo, useCallback, useMemo } from 'react'
import { ActionModal, type ActionModalBaseProps } from '../../components/index.js'
import { useI18N } from '../../../../utils/i18n-next-ui.js'
import { Appearance } from '@masknet/public-api'
import { List, ListItemButton, ListItemIcon, ListItemText, Radio } from '@mui/material'
import { getEnumAsArray } from '@masknet/kit'
import { Icons } from '@masknet/icons'
import Services from '#services'
import { useAppearance } from '../../../../../dashboard/pages/Personas/api.js'

const useStyles = makeStyles()((theme) => ({
    item: {
        padding: theme.spacing(1.5),
    },
    icon: {
        minWidth: 24,
        height: 16,
        color: theme.palette.maskColor.main,
        '& > *': {
            width: 16,
            height: 16,
        },
    },
    text: {
        fontWeight: 700,
        fontSize: 12,
        lineHeight: '16px',
    },
    radio: {
        padding: 0,
    },
}))

const APPEARANCE_ICON_MAP = {
    [Appearance.default]: null,
    [Appearance.light]: <Icons.Sun />,
    [Appearance.dark]: <Icons.Dark />,
}

export const SelectAppearanceModal = memo<ActionModalBaseProps>(function SelectAppearanceModal(...rest) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const mode = useAppearance()
    const APPEARANCE_OPTIONS_MAP = useMemo(
        () => ({
            [Appearance.default]: t('popups_settings_appearance_default'),
            [Appearance.light]: t('popups_settings_appearance_light'),
            [Appearance.dark]: t('popups_settings_appearance_dark'),
        }),
        [],
    )

    const handleAppearanceChange = useCallback(async (target: Appearance) => {
        await Services.Settings.setTheme(target)
    }, [])

    return (
        <ActionModal header={t('popups_settings_appearance')}>
            <List>
                {getEnumAsArray(Appearance).map((x) => {
                    const icon = APPEARANCE_ICON_MAP[x.value]

                    return (
                        <ListItemButton
                            className={classes.item}
                            key={x.key}
                            onClick={() => handleAppearanceChange(x.value)}>
                            {icon ? <ListItemIcon className={classes.icon}>{icon}</ListItemIcon> : null}
                            <ListItemText
                                classes={{ primary: classes.text }}
                                primary={APPEARANCE_OPTIONS_MAP[x.value]}
                            />
                            <Radio className={classes.radio} checked={mode === x.value} />
                        </ListItemButton>
                    )
                })}
            </List>
        </ActionModal>
    )
})
