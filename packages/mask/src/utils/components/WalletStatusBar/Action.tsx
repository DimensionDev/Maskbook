import { memo, PropsWithChildren, useLayoutEffect, useRef, useState } from 'react'
import { Box, Button } from '@mui/material'
import { useI18N } from '../../i18n-next-ui'

interface ActionProps extends PropsWithChildren<{}> {
    openSelectWalletDialog: () => void
}

export const Action = memo<ActionProps>(({ children, openSelectWalletDialog }) => {
    const ref = useRef<HTMLDivElement>()
    const { t } = useI18N()
    const [emptyChildren, setEmptyChildren] = useState(false)

    useLayoutEffect(() => {
        if (ref.current?.children.length && ref.current.children.length > 1) {
            setEmptyChildren(false)
        } else {
            setEmptyChildren(true)
        }
    }, [children])

    return (
        <Box display="flex" columnGap={16} minWidth={276} ref={ref}>
            <Button fullWidth onClick={openSelectWalletDialog} style={{ display: !emptyChildren ? 'none' : undefined }}>
                {t('wallet_status_button_change')}
            </Button>
            {children}
        </Box>
    )
})
