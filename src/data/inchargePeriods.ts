export interface InchargePeriod {
  period_number: number;
  start_date: string;
  end_date: string;
  label: string;
}

export const inchargePeriods: InchargePeriod[] = [
  {
    period_number: 16,
    start_date: '2025-07-29',
    end_date: '2025-08-11',
    label: 'Period 16: 29 Jul - 11 Aug'
  },
  {
    period_number: 17,
    start_date: '2025-08-12',
    end_date: '2025-08-25',
    label: 'Period 17: 12 Aug - 25 Aug'
  },
  {
    period_number: 18,
    start_date: '2025-08-26',
    end_date: '2025-09-08',
    label: 'Period 18: 26 Aug - 8 Sep'
  },
  {
    period_number: 19,
    start_date: '2025-09-09',
    end_date: '2025-09-22',
    label: 'Period 19: 9 Sep - 22 Sep'
  },
  {
    period_number: 20,
    start_date: '2025-09-23',
    end_date: '2025-10-06',
    label: 'Period 20: 23 Sep - 6 Oct'
  },
  {
    period_number: 21,
    start_date: '2025-10-07',
    end_date: '2025-10-20',
    label: 'Period 21: 7 Oct - 20 Oct'
  },
  {
    period_number: 22,
    start_date: '2025-10-21',
    end_date: '2025-11-03',
    label: 'Period 22: 21 Oct - 3 Nov'
  },
  {
    period_number: 23,
    start_date: '2025-11-04',
    end_date: '2025-11-17',
    label: 'Period 23: 4 Nov - 17 Nov'
  },
  {
    period_number: 24,
    start_date: '2025-11-18',
    end_date: '2025-12-01',
    label: 'Period 24: 18 Nov - 1 Dec'
  },
  {
    period_number: 25,
    start_date: '2025-12-02',
    end_date: '2025-12-15',
    label: 'Period 25: 2 Dec - 15 Dec'
  },
  {
    period_number: 26,
    start_date: '2025-12-16',
    end_date: '2025-12-29',
    label: 'Period 26: 16 Dec - 29 Dec'
  }
];