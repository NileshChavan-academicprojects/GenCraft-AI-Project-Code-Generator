
'use server';
/**
 * @fileOverview An AI agent that provides strategic advice to guide initial project development.
 *
 * - generateStrategicAdvice - A function that handles the strategic advice generation process.
 * - StrategicAdviceInput - The input type for the generateStrategicAdvice function.
 * - StrategicAdviceOutput - The return type for the generateStrategicAdvice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StrategicAdviceInputSchema = z.object({
  projectIdea: z.string().describe("The user's original project idea."),
  projectPlan: z.string().describe("The generated project plan (as a JSON string)."),
  // removed generatedCode and projectInsights as this flow now runs before code generation
});
export type StrategicAdviceInput = z.infer<typeof StrategicAdviceInputSchema>;

const StrategicAdviceOutputSchema = z.object({
  keyConsideration: z.string().describe("A key aspect or critical factor to consider for this project's success, guiding initial coding."),
  nextStepSuggestion: z.string().describe("A logical and actionable next coding step or initial feature to implement based on the plan."),
  potentialChallenge: z.string().describe("A potential technical challenge, risk, or hurdle to be mindful of during early development."),
  longTermThought: z.string().describe("A thought on the project's long-term potential, scalability, or future evolution, relevant for initial architectural choices."),
});
export type StrategicAdviceOutput = z.infer<typeof StrategicAdviceOutputSchema>;

export async function generateStrategicAdvice(input: StrategicAdviceInput): Promise<StrategicAdviceOutput> {
  return strategicAdviceFlow(input);
}

const advicePrompt = ai.definePrompt({
  name: 'strategicAdvicePrompt',
  input: {schema: StrategicAdviceInputSchema},
  output: {schema: StrategicAdviceOutputSchema},
  prompt: `You are an experienced CTO and project strategist. Based *only* on the project's initial idea and plan, provide strategic advice that would be most helpful for guiding the *initial software development and coding phase*. This advice will be used by another AI to generate the starter code.

Project Idea: {{{projectIdea}}}

Project Plan (JSON):
{{{projectPlan}}}

Based on the above, provide:
1.  keyConsideration: A critical factor or key aspect for the developers to focus on during the initial coding.
2.  nextStepSuggestion: A logical first coding step, feature, or architectural pattern to implement based on the plan.
3.  potentialChallenge: A technical challenge or implementation risk the developers should anticipate during early development.
4.  longTermThought: A thought on how initial architectural choices might impact future scalability or maintenance, for the developers to keep in mind from the start.

Output ONLY the JSON object adhering to the schema.`,
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
    ],
  },
});

const strategicAdviceFlow = ai.defineFlow(
  {
    name: 'strategicAdviceFlow',
    inputSchema: StrategicAdviceInputSchema,
    outputSchema: StrategicAdviceOutputSchema,
  },
  async (input) => {
    // Removed generatedCode processing as it's no longer an input
    try {
      const {output} = await advicePrompt(input); // Pass input directly

      if (!output) {
        console.warn('Strategic advice prompt completed but output was null or undefined.');
        return {
          keyConsideration: "Strategic advice generation returned no specific consideration.",
          nextStepSuggestion: "Review project goals and refine requirements for coding.",
          potentialChallenge: "Ensuring clarity of initial feature set for development.",
          longTermThought: "Consider modular design for future expansion from the outset.",
        };
      }
      return output;
    } catch (error) {
      console.error('Error during strategicAdvicePrompt execution:', error);
      return {
        keyConsideration: "Error generating key consideration for development.",
        nextStepSuggestion: "Error generating next step suggestion for coding.",
        potentialChallenge: "Error generating potential challenge for development.",
        longTermThought: "Error generating long term thought for architecture.",
      };
    }
  }
);

