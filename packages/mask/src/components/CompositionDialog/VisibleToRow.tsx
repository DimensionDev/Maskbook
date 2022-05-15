import { useI18N } from '../../utils'
import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { PopoverListTrigger } from './PopoverListTrigger'
import { useState } from 'react'
import { PopoverListItem, PopoverListItemType } from './PopoverListItem'
import { DisabledReason } from './CompositionUI'
import { RightArrowIcon } from '@masknet/icons'

const useStyles = makeStyles()((theme) => ({
    optionTitle: {
        fontFamily: 'sans-serif',
        fontSize: 14,
        lineHeight: '18px',
        color: theme.palette.text.secondary,
        marginRight: 12,
    },
    popper: {
        overflow: 'visible',
        boxShadow: '0px 0px 16px 0px rgba(101, 119, 134, 0.2)',
        borderRadius: 4,
    },
    popperText: {
        fontSize: 14,
        fontWeight: 700,
        lineHeight: '18px',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        cursor: 'pointer',
    },
    item: {
        display: 'flex',
        alignItems: 'center',
    },
    divider: {
        width: '100%',
        height: 1,
        background: theme.palette.divider,
        margin: '8px 0',
    },
    mainTitle: {
        fontSize: 14,
        color: theme.palette.text.primary,
        fontWeight: 700,
    },
    subTitle: {
        fontSize: 14,
        color: theme.palette.text.secondary,
        whiteSpace: 'nowrap',
    },
    paper: {
        width: 280,
        padding: 12,
        boxSizing: 'border-box',
    },
    flex: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 4,
        boxSizing: 'border-box',
    },
    create: {
        fontSize: 14,
        cursor: 'pointer',
        fontWeight: 700,
        color: theme.palette.primary.main,
    },
    rightIcon: {
        marginLeft: 'auto',
    },
    pointer: {
        cursor: 'pointer',
    },
}))

interface VisibleToRowProps {
    selected: Partial<PopoverListItemType>
    e2eDisabled: DisabledReason | undefined
    onCreatePersona(): void
    onConnectPersona(): void
    onChange(v: string): void
    shareWithNum: number
}

export function VisibleToRow(props: VisibleToRowProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    const renderScheme = [
        {
            type: PopoverListItemType.All,
            title: t('compose_encrypt_visible_to_all'),
            subTitle: t('compose_encrypt_visible_to_all_sub'),
            personaRequired: false,
            event: null,
        },
        {
            type: PopoverListItemType.Private,
            title: t('compose_encrypt_visible_to_private'),
            subTitle: t('compose_encrypt_visible_to_private_sub'),
            personaRequired: true,
            event: null,
        },
        {
            type: PopoverListItemType.Share,
            title: t('compose_encrypt_visible_to_share'),
            subTitle: t('compose_encrypt_visible_to_share_sub'),
            personaRequired: true,
            event: null,
        },
    ]

    const PopoverListRender = () => {
        return (
            <>
                {renderScheme.map((x, idx) => (
                    <div key={x.type + idx}>
                        <PopoverListItem
                            onItemClick={() => {
                                if (x.type === PopoverListItemType.Share) {
                                    props.onChange(PopoverListItemType.Share)
                                }
                            }}
                            itemTail={
                                x.type === PopoverListItemType.Share && <RightArrowIcon className={classes.rightIcon} />
                            }
                            disabled={x.personaRequired && !!props.e2eDisabled}
                            value={x.type}
                            title={x.title}
                            subTitle={x.subTitle}
                            showDivider={idx < renderScheme.length - 1}
                        />
                        {x.personaRequired && props.e2eDisabled && (
                            <div className={classes.flex}>
                                <Typography className={classes.mainTitle}>{t('persona_required')}</Typography>
                                <Typography
                                    className={classes.create}
                                    onClick={() => {
                                        if (props.e2eDisabled === DisabledReason.NoPersona && props.onCreatePersona) {
                                            props.onCreatePersona()
                                        }
                                        if (props.e2eDisabled === DisabledReason.NoConnect && props.onConnectPersona) {
                                            props.onConnectPersona()
                                        }
                                    }}>
                                    {props.e2eDisabled === DisabledReason.NoPersona ? t('create') : t('connect')}
                                </Typography>
                            </div>
                        )}
                        {x.personaRequired && props.e2eDisabled === DisabledReason.NoLocalKey && (
                            <div className={classes.flex}>
                                <Typography className={classes.mainTitle}>{t('compose_no_local_key')}</Typography>
                            </div>
                        )}
                    </div>
                ))}
            </>
        )
    }
    const getTitle = () => {
        const selected = props.selected
        const shareWithNum = props.shareWithNum
        if (selected === PopoverListItemType.Share) return `${shareWithNum} friend${shareWithNum! > 1 ? 's' : ''}`
        return renderScheme.find((x) => x.type === selected)?.title
    }
    return (
        <>
            <Typography className={classes.optionTitle}>{t('post_dialog_visible_to')}</Typography>

            <PopoverListTrigger
                selected={props.selected ?? PopoverListItemType.All}
                selectedTitle={getTitle()}
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                onChange={props.onChange!}>
                {PopoverListRender()}
            </PopoverListTrigger>
        </>
    )
}
