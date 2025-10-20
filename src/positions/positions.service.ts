import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class PositionsService {
  constructor(private readonly databaseService: DatabaseService) {}

  // GET all positions
  async getAllPositions() {
    const pool = this.databaseService.getPool();
    const [rows] = await pool.execute(
      'SELECT position_id, position_code, position_name, id AS user_id FROM positions',
    );
    return rows;
  }

  // GET single position by ID
  async getPositionById(id: number) {
    const pool = this.databaseService.getPool();
    const [rows] = await pool.execute(
      'SELECT position_id, position_code, position_name, id AS user_id FROM positions WHERE position_id = ?',
      [id],
    );
    const result = (rows as any[])[0];
    if (!result) {
      throw new NotFoundException(`Position with id ${id} not found`);
    }
    return result;
  }

  // CREATE a new position and return the created row
  async createPosition(data: {
    position_code: string;
    position_name: string;
    user_id?: number;
  }) {
    const pool = this.databaseService.getPool();
    const { position_code, position_name, user_id } = data;

    if (!position_code || !position_name) {
      throw new Error('position_code and position_name are required');
    }

    let insertSql = '';
    let values: any[] = [];

    if (typeof user_id === 'number') {
      insertSql =
        'INSERT INTO positions (position_code, position_name, id, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)';
      values = [position_code, position_name, user_id];
    } else {
      insertSql =
        'INSERT INTO positions (position_code, position_name, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)';
      values = [position_code, position_name];
    }

    const [res]: any = await pool.execute(insertSql, values);
    const insertId = res.insertId;

    const [rows] = await pool.execute(
      'SELECT position_id, position_code, position_name, id AS user_id FROM positions WHERE position_id = ?',
      [insertId],
    );
    return (rows as any[])[0];
  }

  // UPDATE an existing position and return only the message
  async updatePosition(id: number, data: { position_code?: string; position_name?: string }) {
    const pool = this.databaseService.getPool();

    const fields: string[] = [];
    const values: any[] = [];

    if (data.position_code) {
      fields.push('position_code = ?');
      values.push(data.position_code);
    }
    if (data.position_name) {
      fields.push('position_name = ?');
      values.push(data.position_name);
    }

    if (fields.length === 0) {
      // nothing to update — keep behavior consistent and return the same message
      return { message: 'Position updated successfully' };
    }

    // Always update updated_at
    fields.push('updated_at = CURRENT_TIMESTAMP');

    const sql = `UPDATE positions SET ${fields.join(', ')} WHERE position_id = ?`;
    values.push(id);

    const [res]: any = await pool.execute(sql, values);

    if (res.affectedRows === 0) {
      throw new NotFoundException(`Position with id ${id} not found`);
    }

    // Return only the message (no row)
    return { message: 'Position updated successfully' };
  }

  // DELETE a position by id
  async deletePosition(id: number) {
    const pool = this.databaseService.getPool();
    const sql = 'DELETE FROM positions WHERE position_id = ?';
    const [res]: any = await pool.execute(sql, [id]);

    if (res.affectedRows === 0) {
      throw new NotFoundException(`Position with id ${id} not found`);
    }

    return { message: 'Position deleted successfully' };
  }
}