import React from 'react'
import { makeStyles, useTheme, createStyles } from '@material-ui/core'
import AddBoxOutlinedIcon from '@material-ui/icons/AddBoxOutlined'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { getUrl } from '../../../utils/utils'
import ActionButton from './ActionButton'

const useStyle = makeStyles((theme) =>
    createStyles({
        root: {
            color: theme.palette.text.hint,
            whiteSpace: 'pre-line',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
            justifyContent: 'center',
            textAlign: 'center',
            cursor: 'pointer',
            transition: '0.4s',
            '&[data-active=true]': {
                color: 'black',
            },
        },
        button: {
            '& > span:first-child': {
                whiteSpace: 'nowrap',
                display: 'inline-block',
                maxWidth: 320,
                textOverflow: 'ellipsis',
            },
        },
        buttonText: {
            height: 28,
            lineHeight: 1,
            paddingTop: 0,
            paddingBottom: 0,
        },
        placeholder: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            width: 64,
            height: 64,
            margin: '0 auto 20px',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: '64px 64px',
        },
        placeholderImage: {
            width: 64,
            height: 64,
        },
    }),
)

export interface RestoreBoxProps extends withClasses<KeysInferFromUseStyles<typeof useStyle>> {
    file: File | null
    entered: boolean
    enterText: string
    leaveText: string
    placeholder: string
    children?: React.ReactNode
    onClick?: () => void
}

export function RestoreBox(props: RestoreBoxProps) {
    const { entered, file, enterText, leaveText, placeholder, children, onClick } = props
    const classes = useStylesExtends(useStyle(), props)
    const theme = useTheme()
    return (
        <div className={classes.root} data-active={entered} onClick={onClick}>
            <div className={classes.placeholder}>
                {children ? (
                    children
                ) : (
                    <img
                        className={classes.placeholderImage}
                        src={getUrl(`${placeholder}-${theme.palette.type}.png`)}
                    />
                )}
            </div>
            <ActionButton
                className={file ? classes.button : ''}
                classes={{ text: classes.buttonText }}
                color="primary"
                variant="text"
                startIcon={entered || file ? null : <AddBoxOutlinedIcon />}
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => e.preventDefault()}>
                {entered ? enterText : file ? file.name : leaveText}
            </ActionButton>
        </div>
    )
}
