import { FastMCP } from "fastmcp";
import { z } from "zod";

import { addExpense, getExpenses } from "./services/expense.service.js";
import { getCategoriesWithSubcategories } from "./repositories/category.repository.js";

const server = new FastMCP({
  name: "expense-tracker",
  version: "1.0.0",
});

server.addTool({
  name: "add_expense",
  description: `Add an expense to the expense tracker.
  Before calling this tool, consult the expense://categories resource to determine the appropriate category and subcategory.
  If no suitable category or subcategory exists,
  provide a new one.`,
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

server.addTool({
  name: "get_expense",
  description: `Get Expense, This function can accept fromDate, toDate, category and subcategory`,
  parameters: z.object({
    fromDate: z.string().optional(),
    toDate: z.string().optional(),
    category: z.string().optional(),
    subcategory: z.string().optional(),
  }),
  execute: async ({ fromDate, toDate, category, subcategory }) => {
    const expense = getExpenses({ fromDate, toDate, category, subcategory });
    return JSON.stringify(expense);
  },
});

server.addResource({
  uri: "expense://categories",
  name: "Expense Categories",
  description: "Available expense categories and subcategories",
  load: async () => {
    const categories = getCategoriesWithSubcategories();
    return { text: JSON.stringify(categories) };
  },
});

server.addPrompt({
  name: "monthly_expense_analysis",
  description: "Analyze expenses for a given month",
  arguments: [
    {
      name: "month",
      description: "Month to analyze, e.g. August 2026",
      required: true,
    },
  ],
  load: async ({ month }) => {
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `
You are an expense analysis assistant.

Analyze the user's expenses for ${month}.

Your responsibilities:
1. Calculate total spending.
2. Break spending down by category.
3. Identify the highest-spending category.
4. Identify the largest individual expenses.
5. Compare spending across categories.
6. Highlight unusual or noteworthy spending patterns.
7. Give concise, actionable observations.

Use the expense data retrieved from the expense tracker
as the source of truth. Do not invent data.

When useful, present the analysis using tables or charts.
`,
          },
        },
      ],
    };
  },
});

server.addPrompt({
  name: "visualize_last_three_months",
  description: "Visualize and Analyse the spending of last three months",
  load: async () => `You are an expense analysis assistant.

Analyze the user's expenses for the last 3 months.

First, retrieve the relevant expense data using the expense
tracker tools. Use the retrieved data as the only source of truth.

Your analysis should include:

1. Total spending for the period.
2. Spending by category.
3. Top spending categories.
4. Largest individual expenses.
5. Spending trends over time when enough data is available.
6. Any unusual or noteworthy spending patterns.

Visualization requirements:

- Create a visualization whenever it would make the analysis easier to understand.
- Use a bar chart to compare spending between categories.
- Use a line chart to show spending trends over time.
- Use a pie chart only when showing the proportion of total
  spending across a small number of categories.
- Do not create a visualization when there is insufficient data.
- Do not invent or estimate data for a visualization.
- Use the actual expense data retrieved from the expense tracker.

After the visualization, provide a concise explanation of the
most important insights.

Example:

If the expenses are:

Food: ₹5,000
Transport: ₹2,000
Shopping: ₹1,000

Create a category spending visualization and explain that Food
is the largest spending category, followed by Transport and
Shopping.

Focus on useful insights rather than simply repeating the data.`,
});

server.start({ transportType: "stdio" });
