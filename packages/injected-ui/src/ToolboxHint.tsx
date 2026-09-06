import type { ReactNode } from 'react'
import {
    Box,
    ListItemButton as MuiListItemButton,
    ListItemIcon as MuiListItemIcon,
    ListItemText as MuiListItemText,
    Typography as MuiTypography,
    type ListItemButtonProps,
    type ListItemIconProps,
    type ListItemTextProps,
    type SxProps,
    type Theme,
    type TypographyProps,
} from '@mui/material'
import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { GuideStep, type GuideStepProps } from './GuideStep.js'

const useStyles = makeStyles()(() => ({
    title: {
        display: 'flex',
        alignItems: 'center',
    },
}))

export interface ToolboxHintGuideProps
    extends Pick<
        GuideStepProps,
        'total' | 'step' | 'tip' | 'visible' | 'onSkip' | 'onNext' | 'onTry' | 'skipLabel' | 'nextLabel' | 'tryLabel'
    > {}

export interface ToolboxHintProps {
    sx?: SxProps<Theme>
    Container?: React.ComponentType<React.PropsWithChildren>
    ListItemButton?: React.ComponentType<Pick<ListItemButtonProps, 'onClick' | 'children'>>
    ListItemText?: React.ComponentType<Pick<ListItemTextProps, 'primary'>>
    ListItemIcon?: React.ComponentType<Pick<ListItemIconProps, 'children'>>
    Typography?: React.ComponentType<Pick<TypographyProps, 'children' | 'className'>>
    iconSize?: number
    mini?: boolean
    onClick?: () => void
    title?: ReactNode
    /** Renders the onboarding tooltip around the entry when provided; omit to skip it entirely. */
    guide?: ToolboxHintGuideProps
}

/**
 * The "Mask Network" entry injected into a platform's own toolbox/sidebar (the application slot —
 * the wallet slot needs live chain state and isn't decoupled here).
 * Pure UI: the click handler and guide-tour state are resolved by the caller, see
 * packages/mask/content-script/components/InjectedComponents/ToolboxUnstyled.tsx.
 */
export function ToolboxHint(props: ToolboxHintProps) {
    const {
        ListItemButton = MuiListItemButton,
        ListItemIcon = MuiListItemIcon,
        Container = 'div',
        Typography = MuiTypography,
        iconSize = 24,
        mini,
        ListItemText = MuiListItemText,
        onClick,
        title = 'Mask Network',
        guide,
        ...rest
    } = props
    const { classes } = useStyles()

    const Entry = (
        <Container {...rest}>
            <ListItemButton onClick={onClick}>
                <ListItemIcon>
                    <Icons.MaskBlue size={iconSize} />
                </ListItemIcon>
                {mini ? null : (
                    <ListItemText
                        primary={
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}>
                                <Typography className={classes.title}>{title}</Typography>
                            </Box>
                        }
                    />
                )}
            </ListItemButton>
        </Container>
    )

    return guide ? <GuideStep {...guide}>{Entry}</GuideStep> : Entry
}
