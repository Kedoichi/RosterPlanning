export interface Employee {
  id: string;
  name: string;
  role: string;
}

export interface Event {
  id: string;
  title: string;
  employeeId?: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  duration: number;
  bgColor?: string;
  rosterId?: string;
}

export interface Store {
  id: string;
  name: string;
}
