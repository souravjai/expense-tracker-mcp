import db from "../db.js";

export type Expense = {
  id: number;
  date: string;
  subcategoryId: number;
  description: string | null;
  amount: number;
};

export const getExpense = (id: number): Expense | undefined => {
  return db
    .prepare(
      `
      SELECT
        id,
        date,
        subcategory_id AS subcategoryId,
        description,
        amount
      FROM expenses
      WHERE id = ?
    `,
    )
    .get(id) as Expense | undefined;
};

export const getExpenses = (): Expense[] => {
  return db
    .prepare(
      `
      SELECT
        id,
        date,
        subcategory_id AS subcategoryId,
        description,
        amount
      FROM expenses
      ORDER BY date DESC, id DESC
    `,
    )
    .all() as Expense[];
};

export const createExpense = ({
  date,
  subcategoryId,
  description,
  amount,
}: Omit<Expense, "id">): Expense => {
  const result = db
    .prepare(
      `
      INSERT INTO expenses (
        date,
        subcategory_id,
        description,
        amount
      )
      VALUES (?, ?, ?, ?)
    `,
    )
    .run(date, subcategoryId, description, amount);

  return {
    id: Number(result.lastInsertRowid),
    date,
    subcategoryId,
    description,
    amount,
  };
};

export const updateExpense = (
  id: number,
  { date, subcategoryId, description, amount }: Omit<Expense, "id">,
): Expense => {
  const result = db
    .prepare(
      `
      UPDATE expenses
      SET
        date = ?,
        subcategory_id = ?,
        description = ?,
        amount = ?
      WHERE id = ?
    `,
    )
    .run(date, subcategoryId, description, amount, id);

  if (result.changes === 0) {
    throw new Error(`Expense with id ${id} not found`);
  }

  return {
    id,
    date,
    subcategoryId,
    description,
    amount,
  };
};

export const deleteExpense = (id: number): void => {
  const result = db
    .prepare(
      `
      DELETE FROM expenses
      WHERE id = ?
    `,
    )
    .run(id);

  if (result.changes === 0) {
    throw new Error(`Expense with id ${id} not found`);
  }
};
