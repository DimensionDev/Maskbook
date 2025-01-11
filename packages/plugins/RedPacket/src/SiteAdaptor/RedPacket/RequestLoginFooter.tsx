import { usePostInfoSource } from '@masknet/plugin-infra/content-script'
import { ActionButton, makeStyles } from '@masknet/theme'
import { Box } from '@mui/material'
import { Trans } from '@lingui/react/macro'
import type { BoxProps } from '@mui/system'

const useStyles = makeStyles()((theme) => {
    return {
        footer: {
            boxSizing: 'border-box',
            padding: theme.spacing(1.5),
        },
    }
})

interface OperationFooterProps extends BoxProps {
    onRequest?(): void
}
export function RequestLoginFooter({ onRequest, ...rest }: OperationFooterProps) {
    const { classes, cx } = useStyles()
    const source = usePostInfoSource()

    return (
        <Box {...rest} className={cx(classes.footer, rest.className)}>
            <ActionButton fullWidth variant="roundedDark" onClick={onRequest}>
                <Trans>Connect to {source}</Trans>
            </ActionButton>
        </Box>
    )
}
