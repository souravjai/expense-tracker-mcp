import db from "../db.js";

export type Expense = {
  id: number;
  date: string;
  subcategoryId: number;
  description: string | null;
  amount: number;
};

type UpdateExpenseParameter = {
  id: number;
  amount?: number;
  date?: string;
  subcategoryId?: number;
  description?: string | null;
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

export const updateExpense = ({
  id,
  amount,
  date,
  subcategoryId,
  description,
}: UpdateExpenseParameter): Expense => {
  const fields: string[] = [];
  const parameters: unknown[] = [];

  if (amount !== undefined) {
    fields.push("amount = ?");
    parameters.push(amount);
  }

  if (date !== undefined) {
    fields.push("date = ?");
    parameters.push(date);
  }

  if (subcategoryId !== undefined) {
    fields.push("subcategory_id = ?");
    parameters.push(subcategoryId);
  }

  if (description !== undefined) {
    fields.push("description = ?");
    parameters.push(description);
  }

  if (fields.length === 0) {
    throw new Error("No fields provided for update");
  }

  parameters.push(id);

  const result = db
    .prepare(
      `
      UPDATE expenses
      SET ${fields.join(", ")}
      WHERE id = ?
    `,
    )
    .run(...parameters);

  if (result.changes === 0) {
    throw new Error(`Expense with id ${id} not found`);
  }

  const expense = getExpense(id);

  if (!expense) {
    throw new Error(`Expense with id ${id} not found`);
  }

  return expense;
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
