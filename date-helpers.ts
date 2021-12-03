import { parse, format } from 'date-fns';

export function parseDate(dateString: string) {
	return parse(dateString, 'dd/MM/yyyy', new Date());
}

export function formatDate(date: Date) {
	return format(date, 'dd/MM/yyyy');
}
