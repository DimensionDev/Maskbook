import { MaskColorVar } from '@masknet/theme'
import { Select, experimentalStyled as styled, selectClasses, outlinedInputClasses } from '@material-ui/core'

export default styled(Select)(() => ({
    [`& .${selectClasses.select}.${selectClasses.outlined}`]: {
        padding: '12.5px 70px 12.5px 14px !important',
        background: MaskColorVar.normalBackground,
    },
    [`& .${outlinedInputClasses.notchedOutline}`]: {
        borderColor: MaskColorVar.lineLighter,
    },
}))
