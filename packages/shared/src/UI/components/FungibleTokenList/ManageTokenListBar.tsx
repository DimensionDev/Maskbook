import { Edit2Icon } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { Stack, Typography } from '@mui/material'
import { memo } from 'react'
import { useSharedI18N } from '../../../locales'

const useStyles = makeStyles()((theme) => ({
    root: {
        padding: theme.spacing(2.25, 0),
        margin: theme.spacing(0, -3, -3, -3),
        background: theme.palette.background.tipMask,
        boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.05)',
        backdropFilter: 'blur(16px)',
        borderRadius: theme.spacing(0, 0, 1.5, 1.5),
    },
    target: {
        cursor: 'pointer',
        fontWeight: 700,
    },
}))

interface ManageTokenListBarProps {
    onClick(): void
}

export const ManageTokenListBar = memo<ManageTokenListBarProps>(({ onClick }) => {
    const t = useSharedI18N()
    const { classes } = useStyles()
    return (
        <Stack className={classes.root} direction="row" justifyContent="center">
            <Stack className={classes.target} display="inline-flex" gap={2} direction="row" onClick={onClick}>
                <Edit2Icon />
                <Typography>{t.erc20_manage_token_list()}</Typography>
            </Stack>
        </Stack>
    )
})
