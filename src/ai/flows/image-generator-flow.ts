
'use server';
/**
 * @fileOverview Generates a conceptual UI image based on generated React code.
 *
 * - generateImage - A function that handles the image generation process.
 * - GenerateConceptualUiImageInput - The input type for the generateImage function.
 * - GenerateConceptualUiImageOutput - The return type for the generateImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateConceptualUiImageInputSchema = z.object({
  generatedCode: z.string().describe("The generated React code for the project, potentially from multiple files concatenated together."),
});
export type GenerateConceptualUiImageInput = z.infer<typeof GenerateConceptualUiImageInputSchema>;

const GenerateConceptualUiImageOutputSchema = z.string().describe('The generated conceptual UI image as a data URI string.');
export type GenerateConceptualUiImageOutput = z.infer<typeof GenerateConceptualUiImageOutputSchema>;

export async function generateImage(input: GenerateConceptualUiImageInput): Promise<GenerateConceptualUiImageOutput> {
  return generateConceptualUiImageFlow(input);
}

const generateConceptualUiImageFlow = ai.defineFlow(
  {
    name: 'generateConceptualUiImageFlow',
    inputSchema: GenerateConceptualUiImageInputSchema,
    outputSchema: GenerateConceptualUiImageOutputSchema,
  },
  async (input) => {
    const MAX_CODE_LENGTH = 2000; // Increased slightly as it might contain multiple files
    const codeSnippet = input.generatedCode.length > MAX_CODE_LENGTH
      ? input.generatedCode.substring(0, MAX_CODE_LENGTH) + "\n..."
      : input.generatedCode;

    const promptText = `You are a UI/UX designer. Your task is to create a conceptual visual representation of a web application's user interface based *only* on the provided React code snippet(s).
The provided code might be a concatenation of multiple related React files.
Generated React Code Snippet(s) (first ${MAX_CODE_LENGTH} characters):
\`\`\`jsx
${codeSnippet}
\`\`\`

Based *solely* on the provided code snippet(s), generate a single, clean, visually appealing mockup or a conceptual, screenshot-like image of what a simple UI for this application might look like.
The style should be modern, minimalist, and suitable for a web application.
Focus on depicting the visual UI elements suggested by the code (e.g., abstract representations of buttons, forms, lists, cards if they appear in the code).
Do NOT include any actual code text or code syntax highlighting in the image itself. Focus purely on the visual layout and user interface elements.
Ensure the image is safe for all audiences.`;

    try {
      const {media} = await ai.generate({
        model: 'googleai/gemini-2.0-flash-exp', // MUST use this model for images
        prompt: promptText,
        config: {
          responseModalities: ['TEXT', 'IMAGE'], // MUST provide both
        },
      });

      if (media && media.url) {
        return media.url;
      }
      console.warn('Conceptual UI Image generation succeeded but media URL was not found. Returning placeholder.');
      return 'https://placehold.co/600x400.png?text=UI+Mockup+Generation+Issue';
    } catch (error) {
      console.error('Error during conceptual UI image generation flow:', error);
      return 'https://placehold.co/600x400.png?text=UI+Mockup+Error';
    }
  }
);

    