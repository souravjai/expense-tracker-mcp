import {
  createCategory,
  getCategory,
} from "../repositories/category.repository.js";

import {
  createSubcategory,
  getSubcategory,
} from "../repositories/subcategory.repository.js";

import { createExpense } from "../repositories/expense.repository.js";
import db from "../db.js";

type AddExpenseParameter = {
  amount: number;
  category: string;
  subcategory: string;
  description?: string;
  date?: string;
};

type GetExpensesParameter = {
  fromDate?: string;
  toDate?: string;
  category?: string;
  subcategory?: string;
};

export const addExpense = db.transaction(
  ({
    amount,
    category,
    subcategory,
    description,
    date,
  }: AddExpenseParameter) => {
    let categoryRecord = getCategory(category) ?? createCategory(category);

    let subcategoryRecord =
      getSubcategory(subcategory, categoryRecord.id) ??
      createSubcategory(subcategory, categoryRecord.id);

    const expenseDate = date ?? new Date().toISOString().split("T")[0];

    // Create expense
    return createExpense({
      amount,
      date: expenseDate,
      subcategoryId: subcategoryRecord.id,
      description: description ?? null,
    });
  },
);

export const getExpenses = ({
  fromDate,
  toDate,
  category,
  subcategory,
}: GetExpensesParameter) => {
  let statement = `
    SELECT
      e.id,
      e.date,
      c.name AS category,
      s.name AS subcategory,
      e.description,
      e.amount
    FROM expenses e
    JOIN subcategories s ON e.subcategory_id = s.id
    JOIN categories c ON s.category_id = c.id
  `;

  const parameters: string[] = [];
  const conditions: string[] = [];

  if (fromDate) {
    conditions.push("e.date >= ?");
    parameters.push(fromDate);
  }

  if (toDate) {
    conditions.push("e.date <= ?");
    parameters.push(toDate);
  }

  if (category) {
    conditions.push("LOWER(c.name) = LOWER(?)");
    parameters.push(category);
  }

  if (subcategory) {
    conditions.push("LOWER(s.name) = LOWER(?)");
    parameters.push(subcategory);
  }

  if (conditions.length > 0) {
    statement += ` WHERE ${conditions.join(" AND ")}`;
  }

  statement += ` ORDER BY e.date DESC`;

  return db.prepare(statement).all(...parameters);
};
