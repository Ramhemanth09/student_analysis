// VNR VJIET B.Tech Academic Year and Department Mapping

export const BTECH_YEAR_MAP: Record<string, string> = {
  '1st Year': 'B.Tech I Year',
  '2nd Year': 'B.Tech II Year',
  '3rd Year': 'B.Tech III Year',
  '4th Year': 'B.Tech IV Year',
};

export const REVERSE_BTECH_YEAR_MAP: Record<string, string> = {
  'B.Tech I Year': '1st Year',
  'B.Tech II Year': '2nd Year',
  'B.Tech III Year': '3rd Year',
  'B.Tech IV Year': '4th Year',
};

export const BRANCH_NAMES: Record<string, string> = {
  'AIML': 'B.Tech - Artificial Intelligence & Machine Learning',
  'CSE': 'B.Tech - Computer Science & Engineering',
  'ECE': 'B.Tech - Electronics & Communication Engineering',
  'EEE': 'B.Tech - Electrical & Electronics Engineering',
  'IT': 'B.Tech - Information Technology',
};

export function formatClassYear(year: string, formatYear: boolean = true): string {
  if (formatYear && BTECH_YEAR_MAP[year]) {
    return BTECH_YEAR_MAP[year];
  }
  return year;
}

export function formatDepartmentStream(dept: string): string {
  return BRANCH_NAMES[dept] || `B.Tech - ${dept}`;
}
