'use server';

/**
 * @fileOverview A React code generation AI agent.
 *
 * - generateReactCode - A function that handles the React code generation process.
 * - GenerateReactCodeInput - The input type for the generateReactCode function.
 * - GenerateReactCodeOutput - The return type for the generateReactCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateReactCodeInputSchema = z.object({
  projectIdea: z.string().describe('The user provided project idea.'),
  projectPlan: z.string().describe('The project plan, broken down into milestones.'),
  flowchart: z.string().describe('The flowchart diagram as an SVG string.'),
});
export type GenerateReactCodeInput = z.infer<typeof GenerateReactCodeInputSchema>;

const GenerateReactCodeOutputSchema = z.object({
  starterCode: z.string().describe('The generated starter React code.'),
});
export type GenerateReactCodeOutput = z.infer<typeof GenerateReactCodeOutputSchema>;

export async function generateReactCode(input: GenerateReactCodeInput): Promise<GenerateReactCodeOutput> {
  return generateReactCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReactCodePrompt',
  input: {schema: GenerateReactCodeInputSchema},
  output: {schema: GenerateReactCodeOutputSchema},
  prompt: `You are a senior React developer tasked with generating starter code for a web application.

  Based on the project idea, project plan and flowchart provided, generate a basic React application structure.

  Project Idea: {{{projectIdea}}}
  Project Plan: {{{projectPlan}}}
  Flowchart: {{{flowchart}}}

  Ensure the code is well-structured, easy to understand, and includes basic components and styling where appropriate.
  The code should include all necessary imports and a basic file structure.
  Output ONLY valid, runnable code, with no explanations or comments.

  The output should be the complete code, suitable for saving to a file.
  `,
});

const generateReactCodeFlow = ai.defineFlow(
  {
    name: 'generateReactCodeFlow',
    inputSchema: GenerateReactCodeInputSchema,
    outputSchema: GenerateReactCodeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
