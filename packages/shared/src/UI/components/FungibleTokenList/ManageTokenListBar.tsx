import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { Stack, Typography, type StackProps } from '@mui/material'
import { memo } from 'react'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    root: {
        padding: theme.spacing(2.25, 0),
        margin: theme.spacing(2, -2, -2, -2),
        boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.05)',
        backdropFilter: 'blur(16px)',
        borderRadius: theme.spacing(0, 0, 1.5, 1.5),
    },
    target: {
        cursor: 'pointer',
        fontWeight: 700,
    },
}))

interface ManageTokenListBarProps extends StackProps {
    onEdit(): void
}

export const ManageTokenListBar = memo<ManageTokenListBarProps>(function ManageTokenListBar({ onEdit, ...rest }) {
    const { classes, cx } = useStyles()
    return (
        <Stack direction="row" justifyContent="center" {...rest} className={cx(classes.root, rest.className)}>
            <Stack className={classes.target} display="inline-flex" gap={2} direction="row" onClick={onEdit}>
                <Icons.Edit2 />
                <Typography>
                    <Trans>Manage Token Lists</Trans>
                </Typography>
            </Stack>
        </Stack>
    )
})
