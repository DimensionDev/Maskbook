import { experimentalStyled as styled } from '@material-ui/core/styles'
import { MaskColorVar } from '@masknet/theme'

export const ContentContainer = styled('div')(({ theme }) => ({
    flex: 1,
    borderRadius: Number(theme.shape.borderRadius) * 5,
    backgroundColor: MaskColorVar.primaryBackground,
}))
