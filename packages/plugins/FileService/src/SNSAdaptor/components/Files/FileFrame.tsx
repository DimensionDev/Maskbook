import { FC, HTMLProps, memo, PropsWithChildren, ReactNode, useLayoutEffect, useRef, useState } from 'react'
import { Icons } from '@masknet/icons'
import { Typography } from '@mui/material'
import { makeStyles, ShadowRootTooltip, useBoundedPopperProps } from '@masknet/theme'
import type { FileInfo } from '../../../types.js'

const useStyles = makeStyles()((theme) => ({
    file: {
        boxShadow:
            theme.palette.mode === 'dark'
                ? '0px 0px 20px rgba(255, 255, 255, 0.12)'
                : '0px 0px 20px rgba(0, 0, 0, 0.05)',
        backgroundColor: theme.palette.maskColor.bottom,
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(1.5),
        overflow: 'auto',
    },
    content: {
        flexGrow: 1,
        marginRight: 'auto',
        marginLeft: theme.spacing(1),
        overflow: 'auto',
    },
    name: {
        color: theme.palette.maskColor.main,
        fontWeight: 700,
        lineHeight: '18px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
}))

export interface FileBaseProps extends HTMLProps<HTMLDivElement> {
    file: FileInfo
}

interface FileFrameProps extends FileBaseProps {
    operations?: ReactNode
}

export const FileFrame: FC<PropsWithChildren<FileFrameProps>> = memo(function FileFrame({
    className,
    children,
    file,
    operations,
    ...rest
}) {
    const { classes, cx } = useStyles()

    const rootRef = useRef<HTMLDivElement>(null)

    const nameRef = useRef<HTMLDivElement>(null)
    const [showTooltip, setShowTooltip] = useState(false)
    useLayoutEffect(() => {
        if (nameRef.current) {
            setShowTooltip(nameRef.current.offsetWidth !== nameRef.current.scrollWidth)
        }
    }, [nameRef.current])

    const tooltipPopperProps = useBoundedPopperProps()

    return (
        <div className={cx(className, classes.file)} {...rest} ref={rootRef}>
            <Icons.Message size={24} />
            <div className={classes.content}>
                <ShadowRootTooltip
                    title={showTooltip ? file.name : undefined}
                    disableInteractive
                    arrow
                    PopperProps={tooltipPopperProps}>
                    <Typography className={classes.name} ref={nameRef}>
                        {file.name}
                    </Typography>
                </ShadowRootTooltip>
                {children}
            </div>
            {operations}
        </div>
    )
})

FileFrame.displayName = 'FileFrame'
