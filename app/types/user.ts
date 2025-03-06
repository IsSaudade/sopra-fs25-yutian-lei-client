export interface User {
  id: string;
  username: string;
  name?: string;
  password?: string; // Only used for registration
  token?: string;
  status: string;
  creation_date: string | Date;
  birthday?: string | Date | null;
}