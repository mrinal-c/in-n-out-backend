import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { z } from "zod";
import { ITransaction } from "../models/Transaction";


// Define the tools for the agent to use
// const tools = [];
// const toolNode = new ToolNode(tools);

// Create a model and give it access to the tools
// const model = new ChatOpenAI({
//   model: "gpt-4o-mini",
//   temperature: 0,
// }).bindTools(tools);
const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0
});

const TransactionZodSchema = z.object({
    description: z.string(),
    amount: z.number(),
    transactionDate: z.string(),
    tags: z.array(z.string()),
    payment: z.string(),
});

async function parseTransaction(query: string): Promise<any> {
    const system_prompt = `
    You are an expert at structured data extraction for a local bank. Given a customer query, you need to extract the following fields:
    - **date**: The date of the transaction
    - **amount**: The transaction amount in numerical format
    - **payment**: The payment method (e.g., Visa, MasterCard, Cash, etc.)
    - **description**: A short description of the transaction
    - **tags**: Relevant categories for the transaction (e.g., lunch, dinner, personal, subscription, etc.)
    `;

    const messages = [new SystemMessage(system_prompt), new HumanMessage(query)]

    const llm_with_structured_output = llm
        .withStructuredOutput(TransactionZodSchema);

    

    try {
        const response = await llm_with_structured_output.invoke(messages);
        const parsedResult = TransactionZodSchema.safeParse(response);

        if (!parsedResult.success) {
            throw new Error(`Failed to parse transaction: ${parsedResult.error.message}`);
        }

        return parsedResult.data;
    } catch (error) {
        console.error("Error parsing transaction:", error);
        throw new Error("Unable to extract transaction details from the user input.");
    }
}

export { parseTransaction, TransactionZodSchema };
