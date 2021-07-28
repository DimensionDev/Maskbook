declare global {
    module '@material-ui/core/Button' {
        interface ButtonPropsVariantOverrides {
            rounded: true
        }
    }
    module '@material-ui/core/Paper' {
        interface PaperPropsVariantOverrides {
            background: true
        }
    }
}
