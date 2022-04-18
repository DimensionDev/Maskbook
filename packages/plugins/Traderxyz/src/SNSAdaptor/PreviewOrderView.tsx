/* eslint-disable no-restricted-imports */
/* eslint-disable spaced-comment */
/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Chip, Grid, IconButton, Typography, Avatar } from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
export const PreviewOrderView = (props: {
    nftList: any
    setDisplaySection: any
    classes: any
    amountLabel: any
}): JSX.Element => {
    const { nftList, classes, amountLabel } = props
    const child = (
        <img
            alt="no-image"
            src="https://trader.xyz/images/missing-img-lg.png"
            className={classes.previewBoxInnerGridContainerItemImg}
        />
    )

    const previewImages = nftList?.map((item: any, index: any) => {
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

    let labelString = ''

    if (nftList.length > 0) {
        labelString = `Buy ${nftList[0].nft_name} (#${nftList[0].nft_id})`

        if (nftList.length == 2) {
            labelString += ` and ${nftList[1].nft_name} (#${nftList[1].nft_id})`
        }

        if (nftList.length > 2) {
            labelString += ' and Others'
        }
    }

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
                        <Typography variant="h4" className={classes.mainTitle}>
                            Confirm and Share
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="h6" className={classes.mainTitle}>
                            Ready to checkout! Take a final look to confirm your order?
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
                                Waiting for your confirmation
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>
            </Grid>
        </div>
    )
}
