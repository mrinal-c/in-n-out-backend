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



export async function parseTransaction(query: string, tags: string[], payments: string[]): Promise<object | undefined> {
    const system_prompt = `
    You are an expert at structured data extraction for a local bank. Given a customer transaction descriptions, you need to extract the following fields:
    - **transactionDate**: The date of the transaction. For reference, todays date is ${new Date().toISOString()}
    - **amount**: The transaction amount in numerical format
    - **payment**: The payment method. Must be a value from ${payments}
    - **description**: A short description of the transaction. Do not make this a sentence, it should just be a few words (<5)
    - **tags**: Relevant categories for the transaction. You can pick up to 5 tags from the following array: ${tags}
    `;

    const TransactionZodSchema = z.object({
        description: z.string(),
        amount: z.number(),
        transactionDate: z.string(),
        tags: z.array(z.string()),
        payment: z.string(),
    });



    const messages = [new SystemMessage(system_prompt), new HumanMessage(query)]

    const llm_with_structured_output = llm
        .withStructuredOutput(TransactionZodSchema);



    try {
        const response = await llm_with_structured_output.invoke(messages);
        const parsedResult = TransactionZodSchema.safeParse(response);

        if (!parsedResult.success) {
            throw new Error(`Failed to parse transaction: ${parsedResult.error.message}`);
        }

        const parsedTransaction = parsedResult.data;
        // Validate the parsed transaction
        if (
            !parsedTransaction.description ||
            !parsedTransaction.amount ||
            !parsedTransaction.transactionDate ||
            !parsedTransaction.payment ||
            parsedTransaction.tags.length === 0 ||
            parsedTransaction.tags.some(tag => !tags.includes(tag)) ||
            !payments.includes(parsedTransaction.payment)
        ) {
            throw new Error("Validation failed: One or more fields are invalid or missing.");
        }

        return parsedTransaction;
    } catch (error) {
        console.error("Error parsing transaction:", error);
    }
}
