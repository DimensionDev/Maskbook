import { memo, useCallback, useMemo } from 'react'
import { List, ListItemButton, ListItemText, Radio } from '@mui/material'
import { getEnumAsArray } from '@masknet/kit'
import { LanguageOptions } from '@masknet/public-api'
import { makeStyles } from '@masknet/theme'
import Services from '#services'
import { ActionModal, type ActionModalBaseProps } from '../../components/index.js'
import { useMaskSharedTrans, useLanguage } from '../../../shared-ui/index.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    item: {
        padding: theme.spacing(1.5),
        borderRadius: 8,
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

export const SelectLanguageModal = memo<ActionModalBaseProps>(function SelectLanguageModal(props) {
    const t = useMaskSharedTrans()
    const { classes } = useStyles()
    const lang = useLanguage()
    const handleLanguageChange = useCallback(async (target: LanguageOptions) => {
        await Services.Settings.setLanguage(target)
    }, [])
    const LANGUAGE_OPTIONS_MAP = useMemo(
        () => ({
            [LanguageOptions.__auto__]: <Trans>Follow System</Trans>,
            [LanguageOptions.enUS]: 'English',
            [LanguageOptions.zhCN]: '简体中文',
            [LanguageOptions.zhTW]: '繁体中文',
            [LanguageOptions.jaJP]: '日本語',
            [LanguageOptions.koKR]: '한국어',
        }),
        [t],
    )

    return (
        <ActionModal header={<Trans>Select language</Trans>} {...props}>
            <List>
                {getEnumAsArray(LanguageOptions).map((x) => {
                    return (
                        <ListItemButton
                            className={classes.item}
                            key={x.key}
                            onClick={() => handleLanguageChange(x.value)}>
                            <ListItemText classes={{ primary: classes.text }} primary={LANGUAGE_OPTIONS_MAP[x.value]} />
                            <Radio className={classes.radio} checked={lang === x.value} />
                        </ListItemButton>
                    )
                })}
            </List>
        </ActionModal>
    )
})
