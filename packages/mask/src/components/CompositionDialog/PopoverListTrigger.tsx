import { RightArrowIcon } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import Popover from '@mui/material/Popover'
import { RadioGroup, Radio, Typography, Box } from '@mui/material'
import { CheckCircle } from '@mui/icons-material'
import { useI18N } from '../../utils'
import { DisabledReason } from './CompositionUI'

const useStyles = makeStyles()((theme) => ({
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

export enum PopoverListItemType {
    All = 'all',
    Private = 'private',
    Share = 'share',
    Text = 'text',
    Image = 'image',
}

interface PopoverListItem {
    type: Partial<PopoverListItemType>
    title: string
    subTitle?: string
    personaRequired?: boolean
    showDivider?: boolean
    e2eDisabled?: number
    toShare?(): void
    onCreatePersona?(): void
    onChange?(v: string): void
    onConnectPersona?(): void
}
export interface PopoverListTriggerProp {
    e2eDisabled?: DisabledReason
    anchorEl: HTMLElement | null
    setAnchorEl(v: HTMLElement | null): void
    onChange(v: string): void
    onCreatePersona?(): void
    onConnectPersona?(): void
    renderScheme: Array<PopoverListItem>
    shareWithNum?: number
    selected: string
    toShare?(): void
}

const PopoverListItem = (props: PopoverListItem) => {
    const {
        title,
        subTitle,
        personaRequired,
        type,
        showDivider,
        e2eDisabled,
        toShare,
        onChange,
        onConnectPersona,
        onCreatePersona,
    } = props
    const { t } = useI18N()
    const { classes, cx } = useStyles()
    const handleItemClick = () => {
        if (!(type === 'share' && toShare && onChange) || !!e2eDisabled) return
        onChange('share')
        toShare()
    }
    const isDisabled = personaRequired && !!e2eDisabled
    return (
        <>
            <div
                style={isDisabled ? { opacity: 0.5 } : {}}
                className={type === 'share' ? cx(classes.item, classes.pointer) : classes.item}
                onClick={handleItemClick}>
                <Radio checkedIcon={<CheckCircle />} disabled={isDisabled} value={type} />
                <Box>
                    <Typography className={classes.mainTitle}>{title}</Typography>
                    <Typography className={classes.subTitle}>{subTitle}</Typography>
                </Box>
                {type === 'share' && <RightArrowIcon className={classes.rightIcon} />}
            </div>
            {personaRequired && e2eDisabled && (
                <div className={classes.flex}>
                    <Typography className={classes.mainTitle}>{t('persona_required')}</Typography>
                    <Typography
                        className={classes.create}
                        onClick={() => {
                            if (e2eDisabled === DisabledReason.NoPersona && onCreatePersona) {
                                onCreatePersona()
                            }
                            if (e2eDisabled === DisabledReason.NoConnect && onConnectPersona) {
                                onConnectPersona()
                            }
                        }}>
                        {e2eDisabled === DisabledReason.NoPersona ? t('create') : t('connect')}
                    </Typography>
                </div>
            )}
            {personaRequired && e2eDisabled === 2 && (
                <div className={classes.flex}>
                    <Typography className={classes.mainTitle}>{t('compose_no_local_key')}</Typography>
                </div>
            )}
            {showDivider && <div className={classes.divider} />}
        </>
    )
}
export function PopoverListTrigger({
    anchorEl,
    setAnchorEl,
    renderScheme,
    selected,
    onChange,
    onCreatePersona,
    onConnectPersona,
    e2eDisabled,
    toShare,
    shareWithNum,
}: PopoverListTriggerProp) {
    const { classes } = useStyles()

    const getName = () => {
        if (selected === 'share') return `${shareWithNum} friend${shareWithNum! > 1 ? 's' : ''}`
        return renderScheme.find((x) => x.type === selected)?.title
    }
    return (
        <>
            <div
                className={classes.popperText}
                onClick={(e) => {
                    setAnchorEl(anchorEl ? null : e.currentTarget)
                }}>
                {getName()}
                <RightArrowIcon />
            </div>
            <Popover
                disablePortal
                className={classes.popper}
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}>
                <RadioGroup
                    className={classes.paper}
                    value={selected}
                    onChange={(e) => {
                        const value = e.target.value
                        onChange(value)
                    }}>
                    {renderScheme.map((x, idx) => {
                        return (
                            <PopoverListItem
                                onConnectPersona={onConnectPersona}
                                onCreatePersona={onCreatePersona}
                                onChange={onChange}
                                toShare={() => {
                                    if (toShare) {
                                        toShare()
                                    }
                                    setAnchorEl(null)
                                }}
                                e2eDisabled={e2eDisabled}
                                key={idx}
                                type={x.type}
                                title={x.title}
                                subTitle={x.subTitle}
                                personaRequired={x.personaRequired}
                                showDivider={idx < renderScheme.length - 1}
                            />
                        )
                    })}
                </RadioGroup>
            </Popover>
        </>
    )
}
