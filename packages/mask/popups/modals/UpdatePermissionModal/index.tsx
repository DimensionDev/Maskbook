import { memo, useCallback } from 'react'
import { ActionModal, useActionModal, type ActionModalBaseProps } from '../../components/index.js'
import { useAsync } from 'react-use'
import Services from '#services'
import { Box, Typography } from '@mui/material'
import { ActionButton, makeStyles } from '@masknet/theme'
import { EMPTY_LIST } from '@masknet/shared-base'
import { Trans } from '@lingui/macro'

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
    const { value: origins = EMPTY_LIST } = useAsync(async () => {
        const result = await Services.SiteAdaptor.getOriginsWithoutPermission()
        return result.flatMap((x) => x.origins)
    }, [])
    const { closeModal } = useActionModal()

    const handleAgree = useCallback(async () => {
        const granted = await browser.permissions.request({ origins })
        if (!granted) return
        closeModal()
    }, [origins])

    const action = (
        <Box>
            <ActionButton onClick={handleAgree} fullWidth>
                <Trans>Approve</Trans>
            </ActionButton>
        </Box>
    )

    return (
        <ActionModal
            header={<Trans>Update X.com Permissions</Trans>}
            headerClassName={classes.header}
            action={action}
            {...props}>
            <Typography className={classes.text}>
                <Trans>Permissions List</Trans>
            </Typography>
            <Box className={classes.permissions}>
                {origins.map((x) => (
                    <span key={x}>{x}</span>
                ))}
            </Box>
            <Typography className={classes.text}>
                <Trans>
                    Since X is now using the new domain name x.com, Mask Network requires users to grant new permissions
                    in order to continue working on x.com.
                </Trans>
            </Typography>
        </ActionModal>
    )
})
