import { memo, type PropsWithChildren, useRef } from 'react'
import { Box, Button } from '@mui/material'
import { useSharedTrans } from '../../../locales/index.js'

interface ActionProps extends PropsWithChildren<{}> {
    onClick?: () => void
}

export const Action = memo<ActionProps>(function Action({ children, onClick }) {
    const ref = useRef<HTMLDivElement>(undefined)
    const t = useSharedTrans()

    return (
        <Box display="flex" columnGap={16} minWidth={276} ref={ref}>
            {children ?? (
                <Button fullWidth onClick={onClick}>
                    {t.wallet_status_button_change()}
                </Button>
            )}
        </Box>
    )
})
