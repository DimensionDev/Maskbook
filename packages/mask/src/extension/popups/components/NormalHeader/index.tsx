// ! This file is used during SSR. DO NOT import new files that does not work in SSR

import { memo, useCallback, useContext, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { PageTitleContext } from '../../context.js'

const useStyles = makeStyles()((theme) => ({
    container: {
        background: theme.palette.maskColor.modalTitleBg,
    },
    header: {
        padding: theme.spacing(2),
        lineHeight: 0,
        display: 'grid',
        gridTemplateColumns: '24px auto 24px',
        alignItems: 'center',
        flexShrink: 0,
    },
    icon: {
        fontSize: 24,
        cursor: 'pointer',
        color: theme.palette.maskColor.main,
    },
    title: {
        fontSize: 18,
        lineHeight: '22px',
        color: theme.palette.maskColor.main,
        fontWeight: 700,
        minHeight: 22,
        textAlign: 'center',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
    },
    logo: {
        width: 96,
        height: 30,
    },
}))

interface NormalHeaderProps {
    onlyTitle?: boolean
    tabList?: ReactNode
    onClose?: () => void
}

function canNavBack() {
    try {
        return history.length !== 1 || !!new URLSearchParams(location.search).get('goBack')
    } catch {}
    return false
}
export const NormalHeader = memo<NormalHeaderProps>(function NormalHeader(props) {
    const { onlyTitle, onClose, tabList } = props
    const { cx, classes } = useStyles()
    const navigate = useNavigate()
    const { title, extension, customBackHandler } = useContext(PageTitleContext)

    const canBack = canNavBack()
    const showTitle = title !== undefined

    const handleBack = useCallback(() => navigate(-1), [])

    if (onlyTitle)
        return (
            <Box className={cx(classes.container, classes.header)} style={{ justifyContent: 'center' }}>
                <Typography className={classes.title}>{title}</Typography>
            </Box>
        )

    return (
        <Box className={classes.container}>
            <Box className={classes.header}>
                {showTitle ? (
                    <>
                        {canBack ? (
                            <Icons.Comeback className={classes.icon} onClick={customBackHandler ?? handleBack} />
                        ) : (
                            <Icons.Close className={classes.icon} onClick={onClose} />
                        )}
                        <Typography className={classes.title}>{title}</Typography>
                        {extension}
                    </>
                ) : (
                    <Icons.Mask className={classes.logo} />
                )}
            </Box>
            {tabList}
        </Box>
    )
})
