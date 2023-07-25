import { memo } from 'react'
import { Box } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../../../utils/i18n-next-ui.js'
import { Icons } from '@masknet/icons'
const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        padding: '11px 12px',
        alignItems: 'center',
        gap: '4px',
        alignSelf: 'stretch',
        background: theme.palette.maskColor.input,
        borderRadius: '8px',
        width: '100%',
    },
    input: {
        flex: 1,
        background: 'transparent',
        border: 'none',
        outline: 'none',
        color: theme.palette.maskColor.main,
    },
}))
export const Search = memo(() => {
    const { classes } = useStyles()
    const { t } = useI18N()
    return (
        <Box className={classes.container}>
            <Icons.Search />
            <input placeholder={t('popupp_encrypted_friends_search_placeholder')} className={classes.input} />
        </Box>
    )
})
