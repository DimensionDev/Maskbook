import { memo, type PropsWithChildren, useLayoutEffect, useRef, useState } from 'react'
import { Box, Button } from '@mui/material'
import { useSharedI18N } from '../../../locales/index.js'
import { Sniffings } from '@masknet/shared-base'

interface ActionProps extends PropsWithChildren<{}> {
    openSelectWalletDialog: () => void
}

export const Action = memo<ActionProps>(function Action({ children, openSelectWalletDialog }) {
    const ref = useRef<HTMLDivElement>()
    const t = useSharedI18N()
    const [emptyChildren, setEmptyChildren] = useState(false)

    useLayoutEffect(() => {
        if (ref.current?.children.length && ref.current.children.length > 1) {
            setEmptyChildren(false)
        } else {
            setEmptyChildren(true)
        }
    }, [children])

    return (
        <Box display="flex" columnGap={16} minWidth={!Sniffings.is_popup_page ? 276 : 176} ref={ref}>
            <Button fullWidth onClick={openSelectWalletDialog} style={{ display: !emptyChildren ? 'none' : undefined }}>
                {t.wallet_status_button_change()}
            </Button>
            {children}
        </Box>
    )
})
