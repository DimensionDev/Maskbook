import { Box, Chip, Grid, IconButton, Typography, Avatar } from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import type { NFTData } from '../types'
import { useI18N } from '../locales/i18n_generated'
import { useMemo } from 'react'

export const PreviewOrderView = (props: {
    nftList: NFTData[] | undefined
    setDisplaySection: Function
    classes: Record<string, string>
    amountLabel: string
}): JSX.Element => {
    const t = useI18N()
    const { nftList, classes, amountLabel } = props
    const child = (
        <img
            alt="no-image"
            src={new URL('./assets/missing-img.png', import.meta.url).toString()}
            className={classes.previewBoxInnerGridContainerItemImg}
        />
    )

    const previewImages = nftList?.map((item: NFTData) => {
        return (
            <>
                <Grid padding={1}>
                    <Avatar
                        className={classes.previewBoxInnerGridContainerItem}
                        children={child}
                        alt={item.nft_name}
                        src={item.image_preview_url}
                    />
                </Grid>
            </>
        )
    })

    const labelString = useMemo(() => {
        let labelString = ''

        const n = nftList
        if (n && n.length > 0) {
            labelString = `${t.preview_order_label_title1()} ${n[0]?.nft_name} (#${n[0]?.nft_id})`

            if (n.length > 1) {
                labelString += ` ${t.preview_order_label_title2()} ${n[1]?.nft_name} (#${n[1]?.nft_id})`
            }
            if (n.length > 2) {
                labelString += ` ${t.preview_order_label_title3()}`
            }
        }
        return labelString
    }, [nftList])

    return (
        <div>
            <Grid item>
                <Grid container spacing={2} direction="row" justifyContent="flex-start" alignItems="center">
                    <Grid item>
                        <IconButton
                            aria-label="go back"
                            className={classes.backBtn}
                            onClick={() => {
                                props.setDisplaySection(false, true, false)
                            }}>
                            <ArrowBack />
                        </IconButton>
                    </Grid>
                    <Grid item xs={10}>
                        <Typography variant="h5" className={classes.mainTitle}>
                            {t.preview_order_heading()}
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="h6" className={classes.mainTitle}>
                            {t.preview_order_subheading()}
                        </Typography>
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={12}>
                <Box className={classes.previewBoxOuter} padding={1}>
                    <Box className={classes.previewBoxInner}>
                        <Grid className={classes.previewBoxInnerGridContainer} padding={0}>
                            {previewImages}
                        </Grid>
                        <Chip className={classes.previewBoxInnerGridContainerChip} label={amountLabel} />
                    </Box>
                    <Grid container direction="column" justifyContent="center" alignItems="flex-start">
                        <Grid item>
                            <Typography
                                paddingTop={1}
                                variant="subtitle1"
                                className={classes.previewBoxInnerGridFooterTitle1}>
                                {labelString}
                            </Typography>
                            <Typography
                                paddingBottom={1}
                                variant="subtitle2"
                                className={classes.previewBoxInnerGridFooterTitle2}>
                                {t.preview_order_confirmation_title()}
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>
            </Grid>
        </div>
    )
}
