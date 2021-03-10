export function getTimestampForChanges() {
    const currentTime = new Date()

    const utcOneHourBack = Date.UTC(
        currentTime.getUTCFullYear(),
        currentTime.getUTCMonth(),
        currentTime.getUTCDate(),
        currentTime.getUTCHours() - 1,
        currentTime.getUTCMinutes(),
    )
    const utcOneDayBack = Date.UTC(
        currentTime.getUTCFullYear(),
        currentTime.getUTCMonth(),
        currentTime.getUTCDate() - 1,
        currentTime.getUTCHours(),
        currentTime.getUTCMinutes(),
    )
    const utcTwoDaysBack = Date.UTC(
        currentTime.getUTCFullYear(),
        currentTime.getUTCMonth(),
        currentTime.getUTCDate() - 2,
        currentTime.getUTCHours(),
        currentTime.getUTCMinutes(),
    )
    const utcWeekBack = Date.UTC(
        currentTime.getUTCFullYear(),
        currentTime.getUTCMonth(),
        currentTime.getUTCDate() - 7,
        currentTime.getUTCHours(),
        currentTime.getUTCMinutes(),
    )

    return {
        utcOneHourBack,
        utcOneDayBack,
        utcTwoDaysBack,
        utcWeekBack,
    }
}
