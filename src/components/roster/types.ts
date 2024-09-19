export interface Employee {
    id: string;
    name: string;
    role: string;
  }
  
  export interface Event {
    id: string;
    title: string;
    start: Date;
    end: Date;
    duration: number;
    bgColor?: string;
  }
  
  export interface Store {
    id: string;
    name: string;
  }