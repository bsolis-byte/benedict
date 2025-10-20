export class User {
  id!: number;
  username!: string;
  password!: string;
  role!: string;
  refresh_token?: string;
  created_at!: Date;
    positions: any;
}