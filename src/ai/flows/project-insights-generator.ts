
'use server';
/**
 * @fileOverview Generates insights about the project based on the idea, plan, and code.
 *
 * - generateProjectInsights - A function that handles the project insights generation process.
 * - GenerateProjectInsightsInput - The input type for the generateProjectInsights function.
 * - ProjectInsightsOutput - The return type for the generateProjectInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProjectInsightsInputSchema = z.object({
  projectIdea: z.string().describe("The user's project idea."),
  projectPlan: z.string().describe("The generated project plan (as a JSON string)."),
  generatedCode: z.string().describe("A snippet of the generated React code."),
});
export type GenerateProjectInsightsInput = z.infer<typeof GenerateProjectInsightsInputSchema>;

const ProjectInsightsOutputSchema = z.object({
  estimatedComplexity: z.string().describe("An estimated complexity (e.g., Simple, Medium, Complex)."),
  suggestedKeywords: z.array(z.string()).describe("A few keywords relevant to the project or potential tech stack."),
  funFactOrTip: z.string().describe("A fun fact or a development tip related to the project idea."),
});
export type ProjectInsightsOutput = z.infer<typeof ProjectInsightsOutputSchema>;

export async function generateProjectInsights(input: GenerateProjectInsightsInput): Promise<ProjectInsightsOutput> {
  return projectInsightsFlow(input);
}

const insightsPrompt = ai.definePrompt({
  name: 'projectInsightsPrompt',
  input: {schema: GenerateProjectInsightsInputSchema},
  output: {schema: ProjectInsightsOutputSchema},
  prompt: `You are an AI assistant that provides helpful insights about a software project.
Based on the project idea, plan, and a code snippet, generate the following:
1.  Estimated Complexity: A simple classification like "Simple", "Medium", or "Complex".
2.  Suggested Keywords: 2-3 keywords that are relevant to the project's domain or potential technologies.
3.  Fun Fact or Tip: A brief, interesting fact or a helpful development tip related to the project idea.

Project Idea: {{{projectIdea}}}
Project Plan: {{{projectPlan}}}
Generated Code Snippet:
\`\`\`
{{{generatedCode}}}
\`\`\`

Provide the output in the structured format defined.`,
config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
    ],
  },
});

const projectInsightsFlow = ai.defineFlow(
  {
    name: 'projectInsightsFlow',
    inputSchema: GenerateProjectInsightsInputSchema,
    outputSchema: ProjectInsightsOutputSchema,
  },
  async (input) => {
    const MAX_CODE_LENGTH = 500;
    const codeSnippet = input.generatedCode.length > MAX_CODE_LENGTH
      ? input.generatedCode.substring(0, MAX_CODE_LENGTH) + "\n..."
      : input.generatedCode;

    try {
        const {output} = await insightsPrompt({
            ...input,
            generatedCode: codeSnippet,
        });

        if (!output) {
            console.warn('Project insights prompt completed but output was null or undefined.');
            return {
                estimatedComplexity: "Unavailable",
                suggestedKeywords: ["general", "web app"],
                funFactOrTip: "Always test your code thoroughly!",
            };
        }
        return output;
    } catch (error) {
        console.error('Error during projectInsightsPrompt execution:', error);
        return {
            estimatedComplexity: "Error",
            suggestedKeywords: [],
            funFactOrTip: "Could not generate insights due to an error.",
        };
    }
  }
);
