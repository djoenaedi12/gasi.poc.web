import { format, parseISO, differenceInDays, isValid } from 'date-fns';
import { id } from 'date-fns/locale';  // locale Indonesia

export function formatDate(date: string | Date, pattern = 'dd MMM yyyy') {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return isValid(d) ? format(d, pattern, { locale: id }) : '-';
}

export function formatDateTime(date: string | Date) {
    return formatDate(date, 'dd MMM yyyy HH:mm');
}

export function daysSince(date: string | Date) {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return differenceInDays(new Date(), d);
}