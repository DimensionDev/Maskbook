import { useState, useEffect, useRef } from 'react'
import { makeStyles } from '@masknet/theme'
import classNames from 'classnames'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { Typography } from '@mui/material'
import { PluginPetMessages } from '../messages'
import { useI18N } from '../../../utils'
import { PluginGameMessages } from '../../Game/messages'
import { NFF_TWITTER } from '../constants'
import { ShowMeta, MenuType } from '../types'
import { useCurrentVisitingUser } from '../hooks'
import { useLastRecognizedIdentity } from '../../../components/DataSource/useActivatedUI'

type Props = {
    isShow: boolean
    mousePosition: { x: number; y: number }
    dragPosition: { x: number; y: number }
    showMeta: ShowMeta | undefined
    onClose: () => void
}

const useStyles = makeStyles()(() => ({
    menu: {
        position: 'fixed',
        minWidth: '180px',
        backgroundColor: '#fff',
        opacity: 0,
        zIndex: 9999,
        transition: 'opacity 50ms',
        animation: 'menu-show 0.5s both',
        borderRadius: '12px',
        pointerEvents: 'none',
        boxShadow: '0 0 12px rgba(0,0,0,.1)',
        '&>div': {
            position: 'relative',
            display: 'block',
            padding: '20px',
            fontSize: '14px',
            transition: 'backgroundColor 100ms',
            cursor: 'pointer',

            '&>span': {
                pointerEvents: 'none',
            },
            '&:hover': {
                backgroundColor: '#f1f1f1',
            },
            '&:first-child': {
                borderRadius: '12px 12px 0 0',
            },
            '&:last-child': {
                borderRadius: '0 0 12px 12px',
            },
        },
    },
    show: {
        opacity: '1 !important',
        pointerEvents: 'auto',
    },
    menuItem: {
        borderTop: '1px solid #f1f1f1',
    },
    icon: {
        position: 'absolute',
        top: '50%',
        right: '20px',
        transform: 'translateY(-50%)',
        height: '16px',
        width: 'auto',
    },
    itemBox: {
        padding: '8px !important',
        backgroundColor: 'transparent !important',
        boxShadow: 'none !important',
        '&>ul': {
            display: 'block',
            margin: 0,
            padding: '20px',
            fontSize: '12px',
            color: '#444',
            boxSizing: 'border-box',
            boxShadow: '0 0 8px rgba(0,0,0,.1)',
            fontWeight: 500,
            backgroundColor: '#fff',
            borderRadius: '12px',
            position: 'absolute',
            bottom: 0,
            left: '8px',
            '&>li': {
                listStyle: 'none',
                padding: '4px 0',
            },
        },
    },
    link: {
        color: '#ccc',
        transition: 'color 200ms',
        '&:hover': {
            color: '#444',
        },
    },
    normal: {
        fontWeight: 'normal',
        color: '#777',
    },
}))

function RightMenu(props: Props) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const refMenuDom = useRef<HTMLDivElement>(null)
    const visitor = useCurrentVisitingUser(0)
    const whoAmI = useLastRecognizedIdentity()

    const [isLeft, setIsLeft] = useState(false)
    const [isTop, setIsTop] = useState(false)

    const { openDialog } = useRemoteControlledDialog(PluginPetMessages.events.essayDialogUpdated)
    const { setDialog: openGameDialog } = useRemoteControlledDialog(PluginGameMessages.events.gameDialogUpdated)

    useEffect(() => {
        if (props.isShow) {
            setIsLeft(props.mousePosition.x > window.innerWidth / 2)
            setIsTop(props.mousePosition.y > window.innerHeight / 2)
            document.body.addEventListener('click', props.onClose, false)
            document.body.addEventListener('scroll', props.onClose, false)
        }

        return () => {
            document.body.removeEventListener('click', props.onClose, false)
            document.body.removeEventListener('scroll', props.onClose, false)
        }
    }, [props.isShow, props.onClose, props.dragPosition.x, props.dragPosition.y])

    function onClickMenu(type: MenuType) {
        switch (type) {
            case MenuType.Setting:
                openDialog()
                break
            case MenuType.Game:
                openGameDialog({
                    open: true,
                    tokenProps: {
                        tokenId: props.showMeta?.tokenId,
                        contract: props.showMeta?.contract,
                        chainId: props.showMeta?.chainId,
                    },
                })
                break
            case MenuType.About:
                window.open(NFF_TWITTER)
                break
        }
        props.onClose()
    }

    function stopPop(e: React.MouseEvent) {
        e.stopPropagation()
        e.nativeEvent.stopPropagation()
    }

    return (
        <div
            ref={refMenuDom}
            onMouseDown={stopPop}
            onMouseUp={stopPop}
            className={classNames(classes.menu, {
                [classes.show]: props.isShow,
            })}
            style={{
                left: props.mousePosition.x,
                top: props.mousePosition.y,
                transform: `translate(${isLeft ? '-100%' : 0}, ${isTop ? '-100%' : 0})`,
            }}>
            <div onClick={() => onClickMenu(MenuType.Setting)}>
                <Typography>{t('plugin_pets_dialog_menu_change')}</Typography>
            </div>
            {visitor.userId === whoAmI?.identifier?.userId ? (
                <div onClick={() => onClickMenu(MenuType.Game)}>
                    <Typography>{t('plugin_pets_dialog_menu_ski')}</Typography>
                </div>
            ) : null}

            <div onClick={() => onClickMenu(MenuType.About)}>
                <Typography>{t('plugin_pets_dialog_menu_about')}</Typography>
            </div>
        </div>
    )
}

export default RightMenu
