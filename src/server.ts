import { FastMCP } from "fastmcp";
import { z } from "zod";

import { addExpense } from "./services/expense.service.js";

const server = new FastMCP({
  name: "expense-tracker",
  version: "1.0.0",
});

server.addTool({
  name: "add_expense",
  description: "Add an expense to the expense tracker.",
  parameters: z.object({
    amount: z.number().positive(),
    category: z.string().min(1),
    subcategory: z.string().min(1),
    description: z.string().optional(),
    date: z.string().optional(),
  }),
  execute: async ({ amount, category, subcategory, description, date }) => {
    const expense = addExpense({
      amount,
      category,
      subcategory,
      description,
      date,
    });

    return JSON.stringify(expense);
  },
});

server.start({ transportType: "stdio" });
