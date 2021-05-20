import { experimentalStyled as styled } from '@material-ui/core/styles'
import { MaskColorVar } from '@dimensiondev/maskbook-theme'

export const ShapeContainer = styled('div')(({ theme }) => ({
    flex: 1,
    borderRadius: Number(theme.shape.borderRadius) * 5,
    backgroundColor: MaskColorVar.primaryBackground,
}))
