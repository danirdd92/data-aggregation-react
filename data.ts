import { formatDate, parseDate } from './date-helpers';
import { eachDayOfInterval, eachMonthOfInterval } from 'date-fns';
import { data as _data } from './dev-data';

export const data = _data.map((val) => {
	const date = parseDate(val.Date);
	return { ...val, Date: date };
});

type GroupPeriod = 'day' | 'month';
type GroupByField = 'UserDisplayName' | 'GroupName';

interface InputData {
	UserDisplayName: string;
	GroupName: string;
	Date: Date;
	TotalHours: number;
}

interface StepOneValues {
	date: Date;
	totalHours: number;
}

interface OutputValues {
	dateStr: string;
	value: number;
}

export const getData = (groupByField: GroupByField, groupPeriod: GroupPeriod, start: Date, end: Date, arrData: InputData[]) => {
	const dict = new Map<string, StepOneValues[]>();

	// Groupd key val pairs by groupByField -> Get StepOne data
	arrData.map((item) => {
		const key = item[groupByField];
		const values: StepOneValues = { date: item.Date, totalHours: item.TotalHours };

		if (!dict.has(key)) {
			const arr: StepOneValues[] = [];
			arr.push(values);
			dict.set(key, arr);
			return;
		}
		const arrValues = dict.get(key);

		if (!arrValues) throw new Error('Your code went wrong, check above to see why array was not initizilized');

		arrValues.push(values);
		dict.set(key, arrValues);
	});

	const interval = { start, end };
	const dates = groupPeriod === 'day' ? eachDayOfInterval(interval) : eachMonthOfInterval(interval);

	const output = convertValues(dict, dates, groupPeriod);
	console.log(output);
};

const convertValues = (map: Map<string, StepOneValues[]>, dates: Date[], groupPeriod: GroupPeriod) => {
	const res = new Map<string, OutputValues[]>();

	// run on all keys of the dict
	map.forEach((values, key) => {
		// init new dict based on each key
		res.set(key, []);

		// iterate over all dates
		const outputVals = dates.map((date) => {
			// get all valued instances of a given day (person can give hours as both dev and managment at the same day)
			const found =
				groupPeriod === 'day'
					? values.filter((x) => formatDate(x.date) === formatDate(date))
					: values.filter((x) => x.date.getMonth() === date.getMonth());

			// if no work for given day found - inititlize date with value of 0
			if (!found) return { dateStr: formatDate(date), value: 0 };

			// sum hours should be needed
			const sumOfHours = found.reduce((val, cur) => (val += cur.totalHours), 0);

			// return array as per requirment
			return { dateStr: formatDate(date), value: sumOfHours };
		});
		res.set(key, outputVals);
	});

	return res;
};
