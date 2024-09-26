import { memo, type PropsWithChildren, useRef } from 'react'
import { Box, Button } from '@mui/material'
import { Sniffings } from '@masknet/shared-base'
import { Trans } from '@lingui/macro'

interface ActionProps extends PropsWithChildren {
    openSelectWalletDialog: () => void
}

export const Action = memo<ActionProps>(function Action({ children, openSelectWalletDialog }) {
    const ref = useRef<HTMLDivElement>(undefined)

    return (
        <Box display="flex" columnGap={16} minWidth={!Sniffings.is_popup_page ? 276 : 176} ref={ref}>
            {children ?? (
                <Button fullWidth onClick={openSelectWalletDialog}>
                    <Trans>Change</Trans>
                </Button>
            )}
        </Box>
    )
})
