import { RightArrowIcon } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import Popover from '@mui/material/Popover'
import { RadioGroup, Radio, Typography } from '@mui/material'
import { useState } from 'react'

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
        color: theme.palette.text.primary,
        fontWeight: 700,
    },
    subTitle: {
        color: theme.palette.text.secondary,
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
interface PopoverListItem {
    type: string
    title: string
    subTitle?: string
    personaRequired?: boolean
    showDivider?: boolean
    hasPersona?: boolean
    toShare?(): void
    setValue?(v: 'share'): void
}
interface PopoverListTriggerProp {
    hasPersona?: boolean
    anchorEl: HTMLElement | null
    setAncorEl(v: HTMLElement | null): void
    onChange(v: string): void
    renderScheme: Array<PopoverListItem>
    shareWithNum?: number
    selected: string
    toShare?(): void
}

const PopoverListItem = (props: PopoverListItem) => {
    const { title, subTitle, personaRequired, type, showDivider, hasPersona, toShare, setValue } = props
    const { classes, cx } = useStyles()
    const handleItemClick = () => {
        if (!(type === 'share' && toShare && setValue)) return
        setValue('share')
        toShare()
    }
    return (
        <>
            <div
                className={type === 'share' ? cx(classes.item, classes.pointer) : classes.item}
                onClick={handleItemClick}>
                <Radio value={type} />
                <div>
                    <Typography className={classes.mainTitle}>{title}</Typography>
                    <Typography className={classes.subTitle}>{subTitle}</Typography>
                </div>
                {type === 'share' && <RightArrowIcon className={classes.rightIcon} />}
            </div>
            {personaRequired && !hasPersona && (
                <div className={classes.flex}>
                    <Typography className={classes.mainTitle}>Persona required</Typography>
                    <Typography className={classes.create}>Create</Typography>
                </div>
            )}
            {showDivider && <div className={classes.divider} />}
        </>
    )
}
export function PopoverListTrigger({
    anchorEl,
    setAncorEl,
    renderScheme,
    selected,
    onChange,
    hasPersona,
    toShare,
    shareWithNum,
}: PopoverListTriggerProp) {
    const { classes } = useStyles()
    const [selectedValue, setSelectedValue] = useState<string>(selected)
    const getName = () => {
        return selectedValue === 'share'
            ? `${shareWithNum} friends`
            : renderScheme.find((x) => x.type === selectedValue)?.title
    }
    return (
        <>
            <div
                className={classes.popperText}
                onClick={(e) => {
                    setAncorEl(anchorEl ? null : e.currentTarget)
                }}>
                {getName()}
                <RightArrowIcon />
            </div>
            <Popover
                disablePortal
                className={classes.popper}
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={() => setAncorEl(null)}
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
                    value={selectedValue}
                    onChange={(e) => {
                        const value = e.target.value
                        setSelectedValue(value)
                        onChange(value)
                    }}>
                    {renderScheme.map((x, idx) => {
                        return (
                            <PopoverListItem
                                setValue={setSelectedValue}
                                toShare={toShare}
                                hasPersona={hasPersona}
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
