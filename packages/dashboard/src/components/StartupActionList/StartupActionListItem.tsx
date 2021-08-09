import {
    ListItem,
    ListItemText,
    ListItemIcon,
    ListItemSecondaryAction,
    Button,
    ButtonProps,
    experimentalStyled as styled,
    Typography,
} from '@material-ui/core'
import { memo, useLayoutEffect, useRef } from 'react'
import { MaskColorVar } from '@masknet/theme'

export interface StartupActionListItemProps {
    icon: React.ReactNode
    title: string
    description: string
    onClick(): void
    action: string
    color?: ButtonProps['color']
}
/**
 * This component is an abstraction of a list of "start up action suggestions".
 */
export const StartupActionListItem = memo((props: StartupActionListItemProps) => {
    const { onClick, color = 'primary', title, description, action, icon } = props
    // I know this is scary. See https://github.com/mui-org/material-ui/issues/13495
    const buttonRef = useRef<HTMLElement>(null)
    const listRef = useRef<HTMLDivElement>(null)
    useLayoutEffect(() => {
        if (!buttonRef.current || !listRef.current) return
        const width = buttonRef.current.getBoundingClientRect().width
        const child = listRef.current.children[0]
        if (!child) return
        ;(child as HTMLElement).style.paddingRight = `${width + 10}px`
    })
    return (
        <Container button ref={listRef}>
            <ListItemIconContainer>{icon}</ListItemIconContainer>
            <ListItemText
                primary={
                    <Typography variant="body1" color="textPrimary">
                        {title}
                    </Typography>
                }
                secondary={
                    <Typography variant="caption" color="textSecondary">
                        {description}
                    </Typography>
                }
            />
            <ListItemSecondaryAction ref={buttonRef}>
                <RoundButton color={color} onClick={onClick} size="small">
                    {action}
                </RoundButton>
            </ListItemSecondaryAction>
        </Container>
    )
})

const Container = styled(ListItem)`
    border: 1px solid ${MaskColorVar.border};
    border-radius: 6px;
`
// TODO: Button should use "big border radius" variant instead of a styled one
const RoundButton = styled(Button)`
    border-radius: 20px;
    min-width: 80px;
`

const ListItemIconContainer = styled(ListItemIcon)`
    // TODO: mobile
    font-size: 48px;
`
