export interface User {
  id: string;
  name: string;
  username: string;
  token: string;
  status: string;
  creation_date: string | Date;
  birthday?: string | Date | null;
  password?: string;
}