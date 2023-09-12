import { memo, useCallback, useMemo } from 'react'
import { ActionModal, type ActionModalBaseProps } from '../../components/index.js'
import { useI18N } from '../../../../utils/i18n-next-ui.js'
import { List, ListItemButton, ListItemIcon, ListItemText, Radio } from '@mui/material'
import { getEnumAsArray } from '@masknet/kit'
import { LanguageOptions } from '@masknet/public-api'
import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import Services from '#services'
import { useLanguage } from '../../../../../dashboard/pages/Personas/api.js'

const LANGUAGE_OPTIONS_ICON_MAP = {
    [LanguageOptions.__auto__]: null,
    [LanguageOptions.enUS]: <Icons.UK />,
    [LanguageOptions.zhCN]: <Icons.CN />,
    [LanguageOptions.zhTW]: <Icons.CN />,
    [LanguageOptions.jaJP]: <Icons.JP />,
    [LanguageOptions.koKR]: <Icons.KR />,
}

const useStyles = makeStyles()((theme) => ({
    item: {
        padding: theme.spacing(1.5),
    },
    icon: {
        minWidth: 24,
        height: 12,
        '& > *': {
            width: 16,
            height: 12,
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

export const SelectLanguageModal = memo<ActionModalBaseProps>(function SelectLanguageModal({ ...rest }) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const lang = useLanguage()

    const handleLanguageChange = useCallback(async (target: LanguageOptions) => {
        await Services.Settings.setLanguage(target)
    }, [])
    const LANGUAGE_OPTIONS_MAP = useMemo(
        () => ({
            [LanguageOptions.__auto__]: t('popups_settings_language_auto'),
            [LanguageOptions.enUS]: 'English',
            [LanguageOptions.zhCN]: '简体中文',
            [LanguageOptions.zhTW]: '繁体中文',
            [LanguageOptions.jaJP]: '日本語',
            [LanguageOptions.koKR]: '한국인',
        }),
        [],
    )

    return (
        <ActionModal header={t('popups_settings_select_language')} {...rest}>
            <List>
                {getEnumAsArray(LanguageOptions).map((x) => {
                    const icon = LANGUAGE_OPTIONS_ICON_MAP[x.value]
                    return (
                        <ListItemButton
                            className={classes.item}
                            key={x.key}
                            onClick={() => handleLanguageChange(x.value)}>
                            {icon ? <ListItemIcon className={classes.icon}>{icon}</ListItemIcon> : null}
                            <ListItemText classes={{ primary: classes.text }} primary={LANGUAGE_OPTIONS_MAP[x.value]} />
                            <Radio className={classes.radio} checked={lang === x.value} />
                        </ListItemButton>
                    )
                })}
            </List>
        </ActionModal>
    )
})
