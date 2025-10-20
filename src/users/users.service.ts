import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, OkPacket } from 'mysql2';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private db: DatabaseService) {}

  private pool = () => this.db.getPool();

  async createUser(username: string, password: string, role = 'user') {
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await this.pool().execute<OkPacket>(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, hashed, role],
    );
    return { id: result.insertId, username, role };
  }

  async findByUsername(username: string) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      // i Removed "refreshToken" column → now only selects `id, username, password, role`
      // Before 'SELECT id, username, password, role, refreshToken FROM users WHERE username = ?'
      // now  'SELECT id, username, password, role, refresh_token FROM users WHERE username = ?'
      // and i Changed DB column name convention from camelCase (`refreshToken`) to snake_case (`refresh_token`)
      'SELECT id, username, password, role, refresh_token FROM users WHERE username = ?',
      [username],
    );
    return rows[0];
  }

  async findById(id: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT id, username, role, created_at FROM users WHERE id = ?',
      [id],
    );
    return rows[0];
  }

  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT id, username, role, created_at FROM users',
    );
    return rows;
  }

  async updateUser(id: number, partial: { username?: string; password?: string; role?: string }) {
    const fields: string[] = [];
    const values: any[] = [];

    if (partial.username) {
      fields.push('username = ?');
      values.push(partial.username);
    }

    if (partial.password) {
      const hashed = await bcrypt.hash(partial.password, 10);
      fields.push('password = ?');
      values.push(hashed);
    }

    if (partial.role) {
      fields.push('role = ?');
      values.push(partial.role);
    }

    if (fields.length === 0) return await this.findById(id);

    values.push(id);
    await this.pool().execute<OkPacket>(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values,
    );
    return this.findById(id);
  }

  async deleteUser(id: number) {
    // i Return value structure
    // before returned `res.affectedRows > 0` (boolean)
    // now returns `{ deletedId: id }` (object with deleted user id)
    // because More descriptive return value (explicitly shows which user was deleted)
    await this.pool().execute<OkPacket>('DELETE FROM users WHERE id = ?', [id]);
    return { deletedId: id };
  }

  async setRefreshToken(userId: number, refreshToken: string | null) {
    // i Changed function name and column name
    // before `async saveRefreshToken(id: number, refreshToken: string | null)`
    // now  `async setRefreshToken(userId: number, refreshToken: string | null)`
    // also i Changed DB column from `refreshToken` → `refresh_token`
    // becuase Consistency with database snake_case naming and clearer function name
    await this.pool().execute<OkPacket>(
      'UPDATE users SET refresh_token = ? WHERE id = ?',
      [refreshToken, userId],
    );
  }

  async findByRefreshToken(refreshToken: string) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      // ans also i Changed DB column from camelCase (`refreshToken`) to snake_case (`refresh_token`)
      'SELECT id, username, role FROM users WHERE refresh_token = ?',
      [refreshToken],
    );
    return rows[0];
  }
}
