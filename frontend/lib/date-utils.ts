import { formatDistanceToNow, isPast, differenceInDays } from 'date-fns';

export function formatClosingDate(date: Date | string | null): { text: string; urgent: boolean; closed: boolean } {
    if (!date) return { text: 'No deadline', urgent: false, closed: false };

    const closingDate = new Date(date);
    const now = new Date();

    if (isPast(closingDate)) {
        const daysAgo = Math.abs(differenceInDays(closingDate, now));
        return {
            text: daysAgo === 0 ? 'Closed today' : `Closed ${daysAgo} day${daysAgo === 1 ? '' : 's'} ago`,
            urgent: false,
            closed: true
        };
    }

    const daysUntil = differenceInDays(closingDate, now);

    if (daysUntil === 0) {
        return { text: 'Closes today!', urgent: true, closed: false };
    } else if (daysUntil === 1) {
        return { text: 'Closes tomorrow', urgent: true, closed: false };
    } else if (daysUntil <= 7) {
        return { text: `Closes in ${daysUntil} days`, urgent: true, closed: false };
    } else {
        return { text: `Closes in ${daysUntil} days`, urgent: false, closed: false };
    }
}
