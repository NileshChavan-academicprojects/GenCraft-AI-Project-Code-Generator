'use server';

/**
 * @fileOverview A project plan generator AI agent.
 *
 * - generateProjectPlan - A function that handles the project plan generation process.
 * - GenerateProjectPlanInput - The input type for the generateProjectPlan function.
 * - GenerateProjectPlanOutput - The return type for the generateProjectPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProjectPlanInputSchema = z.object({
  projectIdea: z.string().describe('The idea for the project.'),
});
export type GenerateProjectPlanInput = z.infer<typeof GenerateProjectPlanInputSchema>;

const GenerateProjectPlanOutputSchema = z.object({
  milestone1: z.string().describe('The first milestone of the project.'),
  milestone2: z.string().describe('The second milestone of the project.'),
  milestone3: z.string().describe('The third milestone of the project.'),
});
export type GenerateProjectPlanOutput = z.infer<typeof GenerateProjectPlanOutputSchema>;

export async function generateProjectPlan(input: GenerateProjectPlanInput): Promise<GenerateProjectPlanOutput> {
  return generateProjectPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProjectPlanPrompt',
  input: {schema: GenerateProjectPlanInputSchema},
  output: {schema: GenerateProjectPlanOutputSchema},
  prompt: `You are a project manager who is good at creating project plans with milestones.

  Given the project idea, create a project plan with 3 milestones.

  Project Idea: {{{projectIdea}}}`,
});

const generateProjectPlanFlow = ai.defineFlow(
  {
    name: 'generateProjectPlanFlow',
    inputSchema: GenerateProjectPlanInputSchema,
    outputSchema: GenerateProjectPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
