
'use server';
/**
 * @fileOverview An AI agent that provides strategic advice on a generated project.
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
  generatedCode: z.string().describe("A snippet or concatenation of the generated React code."),
  projectInsights: z.string().describe("The generated project insights (as a JSON string)."),
});
export type StrategicAdviceInput = z.infer<typeof StrategicAdviceInputSchema>;

const StrategicAdviceOutputSchema = z.object({
  keyConsideration: z.string().describe("A key aspect or critical factor to consider for this project's success."),
  nextStepSuggestion: z.string().describe("A logical and actionable next step to move this project forward."),
  potentialChallenge: z.string().describe("A potential challenge, risk, or hurdle to be mindful of."),
  longTermThought: z.string().describe("A thought on the project's long-term potential, scalability, or future evolution."),
});
export type StrategicAdviceOutput = z.infer<typeof StrategicAdviceOutputSchema>;

export async function generateStrategicAdvice(input: StrategicAdviceInput): Promise<StrategicAdviceOutput> {
  return strategicAdviceFlow(input);
}

const advicePrompt = ai.definePrompt({
  name: 'strategicAdvicePrompt',
  input: {schema: StrategicAdviceInputSchema},
  output: {schema: StrategicAdviceOutputSchema},
  prompt: `You are an experienced CTO and project strategist. You are tasked with providing "deep think" strategic advice based on a project's initial idea, generated plan, code snippets, and preliminary insights.
Review all the provided information and offer concise, high-level strategic advice.

Project Idea: {{{projectIdea}}}

Project Plan (JSON):
{{{projectPlan}}}

Generated Code Snippet (first 1000 chars):
\`\`\`
{{{generatedCode}}}
\`\`\`

Project Insights (JSON):
{{{projectInsights}}}

Based on all the above, provide:
1.  keyConsideration: A critical factor or key aspect for the project's success.
2.  nextStepSuggestion: A logical next step to advance the project.
3.  potentialChallenge: A significant potential challenge or risk.
4.  longTermThought: A forward-looking thought on the project's long-term potential or evolution.

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
    const MAX_CODE_LENGTH = 1000;
    const codeSnippet = input.generatedCode.length > MAX_CODE_LENGTH
      ? input.generatedCode.substring(0, MAX_CODE_LENGTH) + "\n..."
      : input.generatedCode;

    try {
      const {output} = await advicePrompt({
        ...input,
        generatedCode: codeSnippet,
      });

      if (!output) {
        console.warn('Strategic advice prompt completed but output was null or undefined.');
        return {
          keyConsideration: "Strategic advice generation returned no specific consideration.",
          nextStepSuggestion: "Review project goals and refine requirements.",
          potentialChallenge: "Ensuring market fit and user adoption.",
          longTermThought: "Consider potential for feature expansion and scalability.",
        };
      }
      return output;
    } catch (error) {
      console.error('Error during strategicAdvicePrompt execution:', error);
      return {
        keyConsideration: "Error generating key consideration.",
        nextStepSuggestion: "Error generating next step suggestion.",
        potentialChallenge: "Error generating potential challenge.",
        longTermThought: "Error generating long term thought.",
      };
    }
  }
);
