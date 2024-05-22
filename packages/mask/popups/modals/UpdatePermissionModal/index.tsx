import { memo, useCallback } from 'react'
import { ActionModal, useActionModal, type ActionModalBaseProps } from '../../components/index.js'
import { useMaskSharedTrans } from '../../../shared-ui/index.js'
import { useAsync } from 'react-use'
import Services from '#services'
import { Box, Typography } from '@mui/material'
import { ActionButton, makeStyles } from '@masknet/theme'

const useStyles = makeStyles()((theme) => ({
    text: {
        color: theme.palette.maskColor.main,
        fontSize: 14,
        lineHeight: '18px',
    },
    permissions: {
        background: theme.palette.maskColor.bg,
        padding: 6,
        color: theme.palette.maskColor.main,
        fontSize: 14,
        lineHeight: '18px',
        margin: theme.spacing(2, 0),
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        fontSize: 18,
        lineHeight: '22px',
    },
}))

export const UpdatePermissionModal = memo<ActionModalBaseProps>(function UpdatePermissionModal(props) {
    const { classes } = useStyles()
    const t = useMaskSharedTrans()
    const { value: origins = [] } = useAsync(async () => {
        const result = await Services.SiteAdaptor.getOriginsWithoutPermission()
        return result.flatMap((x) => x.origins)
    }, [])
    const { closeModal } = useActionModal()

    const handleAgree = useCallback(async () => {
        const granted = browser.permissions.request({ origins })
        if (!granted) return
        closeModal()
    }, [origins])

    const action = (
        <Box>
            <ActionButton onClick={handleAgree} fullWidth>
                {t.approve()}
            </ActionButton>
        </Box>
    )

    return (
        <ActionModal
            header={t.popups_update_authorization_title()}
            headerClass={classes.header}
            action={action}
            {...props}>
            <Typography className={classes.text}>{t.popups_authorization_list()}</Typography>
            <Box className={classes.permissions}>
                {origins.map((x) => (
                    <span key={x}>{x}</span>
                ))}
            </Box>
            <Typography className={classes.text}>{t.popups_authorization_tips()}</Typography>
        </ActionModal>
    )
})
