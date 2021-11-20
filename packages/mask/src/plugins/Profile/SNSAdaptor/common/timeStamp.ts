export const timeDifferent = (timeStamp: number): string => {
    const date1: any = new Date(timeStamp * 1000)
    const date2: any = Date.now()
    const diffTime = Math.abs(date2 - date1)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const diffHours = Math.ceil((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    if (diffDays === 0) {
        return diffHours + ' hours ago'
    } else if (diffDays > 99 || diffHours === 0) {
        return diffDays + ' days ago'
    } else {
        return diffDays + ' days ' + diffHours + ' hours ago'
    }
}

export const formatDate = (ts: string): string => {
    return new Date(parseInt(ts, 10) * 1000).toLocaleDateString('en-US')
}
