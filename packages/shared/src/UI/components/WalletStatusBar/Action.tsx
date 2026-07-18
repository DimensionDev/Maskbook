import { memo, type PropsWithChildren, useRef } from 'react'
import { Box, Button } from '@mui/material'
import { Sniffings } from '@masknet/shared-base'
import { Trans } from '@lingui/react/macro'

interface ActionProps extends PropsWithChildren {
    openSelectWalletDialog: () => void
}

export const Action = memo<ActionProps>(function Action({ children, openSelectWalletDialog }) {
    const ref = useRef<HTMLDivElement>(undefined)

    return (
        <Box sx={{ display: 'flex', columnGap: 16, minWidth: Sniffings.is_popup_page ? 176 : 276 }} ref={ref}>
            {children ?? (
                <Button fullWidth onClick={openSelectWalletDialog}>
                    <Trans>Change</Trans>
                </Button>
            )}
        </Box>
    )
})
