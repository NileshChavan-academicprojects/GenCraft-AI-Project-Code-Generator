'use server';
/**
 * @fileOverview An AI agent that suggests theme colors based on a project idea.
 *
 * - generateThemeColors - A function that suggests theme colors.
 * - GenerateThemeColorsInput - The input type for the generateThemeColors function.
 * - ThemeColorsOutput - The return type for the generateThemeColors function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateThemeColorsInputSchema = z.object({
  projectIdea: z.string().describe('The project idea to base the theme on.'),
});
export type GenerateThemeColorsInput = z.infer<typeof GenerateThemeColorsInputSchema>;

const ThemeColorsOutputSchema = z.object({
  lightTheme: z.object({
    background: z.string().describe("HSL string for light theme background, e.g., '0 0% 100%'"),
    foreground: z.string().describe("HSL string for light theme foreground, e.g., '222.2 84% 4.9%'"),
    primary: z.string().describe("HSL string for light theme primary, e.g., '222.2 47.4% 11.2%'"),
    accent: z.string().describe("HSL string for light theme accent, e.g., '217.2 91.2% 59.8%'"),
  }),
  // Optionally, you could extend this to suggest dark theme colors too.
});
export type ThemeColorsOutput = z.infer<typeof ThemeColorsOutputSchema>;

export async function generateThemeColors(input: GenerateThemeColorsInput): Promise<ThemeColorsOutput> {
  return themeGeneratorFlow(input);
}

const themePrompt = ai.definePrompt({
  name: 'themeGeneratorPrompt',
  input: {schema: GenerateThemeColorsInputSchema},
  output: {schema: ThemeColorsOutputSchema},
  prompt: `You are a UI/UX color expert. Based on the project idea, suggest a harmonious and accessible color palette.
Provide HSL string values for a light theme: background, foreground, primary, and accent colors.

Project Idea: {{{projectIdea}}}

Output only the HSL values in the specified JSON structure.
Example HSL string format: '120 60% 70%'
Ensure good contrast between background and foreground.
The primary color should be distinct and usable for main interactive elements.
The accent color should be suitable for highlighting or secondary actions.`,
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
    ],
  },
});

const themeGeneratorFlow = ai.defineFlow(
  {
    name: 'themeGeneratorFlow',
    inputSchema: GenerateThemeColorsInputSchema,
    outputSchema: ThemeColorsOutputSchema,
  },
  async (input) => {
    try {
      const {output} = await themePrompt(input);
      if (!output) {
        throw new Error('Theme generation failed to produce an output.');
      }
      return output;
    } catch (error) {
      console.error('Error during themeGeneratorPrompt execution:', error);
      // Fallback to a default safe theme
      return {
        lightTheme: {
          background: '0 0% 100%', // white
          foreground: '0 0% 13%', // near black
          primary: '220 90% 50%', // strong blue
          accent: '30 90% 50%', // strong orange
        },
      };
    }
  }
);
