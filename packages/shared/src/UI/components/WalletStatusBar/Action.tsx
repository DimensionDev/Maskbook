import { memo, type PropsWithChildren, useRef } from 'react'
import { Box, Button } from '@mui/material'
import { useSharedI18N } from '../../../locales/index.js'
import { Sniffings } from '@masknet/shared-base'

interface ActionProps extends PropsWithChildren<{}> {
    openSelectWalletDialog: () => void
}

export const Action = memo<ActionProps>(function Action({ children, openSelectWalletDialog }) {
    const ref = useRef<HTMLDivElement>()
    const t = useSharedI18N()

    return (
        <Box display="flex" columnGap={16} minWidth={!Sniffings.is_popup_page ? 276 : 176} ref={ref}>
            {children ?? (
                <Button fullWidth onClick={openSelectWalletDialog}>
                    {t.wallet_status_button_change()}
                </Button>
            )}
        </Box>
    )
})
