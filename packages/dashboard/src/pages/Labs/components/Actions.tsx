import { TwitterIcon, FacebookIcon } from '@masknet/icons'
import { MaskColorVar } from '@masknet/theme'
import { Button, buttonClasses, styled } from '@material-ui/core'

const StyledButton = styled<typeof Button>(Button)(({ theme }) => ({
    height: '26px',
    borderRadius: '15px',
    fontWeight: 500,
    marginRight: theme.spacing(0.5),
    [`& .${buttonClasses.startIcon}`]: {
        marginRight: theme.spacing(0.5),
    },
}))

export interface ActionProp {
    onClick: () => void
}

export function Twitter({ onClick }: ActionProp) {
    return (
        <StyledButton startIcon={<TwitterIcon />} sx={{ bgcolor: MaskColorVar.twitter }} onClick={onClick}>
            Twitter
        </StyledButton>
    )
}

export function Facebook({ onClick }: ActionProp) {
    return (
        <StyledButton startIcon={<FacebookIcon />} sx={{ bgcolor: MaskColorVar.facebook }} onClick={onClick}>
            Facebook
        </StyledButton>
    )
}

export function Explore({ onClick }: ActionProp) {
    return <StyledButton onClick={onClick}>Explore</StyledButton>
}
