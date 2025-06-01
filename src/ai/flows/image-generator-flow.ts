
'use server';
/**
 * @fileOverview Generates a conceptual UI image based on a project idea and generated code.
 *
 * - generateConceptualUiImage - A function that handles the image generation process.
 * - GenerateConceptualUiImageInput - The input type for the generateConceptualUiImage function.
 * - GenerateConceptualUiImageOutput - The return type for the generateConceptualUiImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateConceptualUiImageInputSchema = z.object({
  projectIdea: z.string().describe("The user's project idea."),
  generatedCode: z.string().describe("The generated React code for the project."),
});
export type GenerateConceptualUiImageInput = z.infer<typeof GenerateConceptualUiImageInputSchema>;

const GenerateConceptualUiImageOutputSchema = z.string().describe('The generated conceptual UI image as a data URI string.');
export type GenerateConceptualUiImageOutput = z.infer<typeof GenerateConceptualUiImageOutputSchema>;

// Renamed function for clarity, though filename remains image-generator-flow.ts for this change
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
    const MAX_CODE_LENGTH = 1000;
    const codeSnippet = input.generatedCode.length > MAX_CODE_LENGTH
      ? input.generatedCode.substring(0, MAX_CODE_LENGTH) + "\n..."
      : input.generatedCode;

    const promptText = `You are a UI/UX designer. Your task is to create a conceptual visual representation of a web application's user interface.
Project Idea: "${input.projectIdea}"
Generated React Code Snippet (first ${MAX_CODE_LENGTH} characters):
\`\`\`jsx
${codeSnippet}
\`\`\`

Based on the project idea and the provided code snippet, generate a single, clean, visually appealing mockup or a conceptual, screenshot-like image of what a simple UI for this application might look like.
The style should be modern, minimalist, and suitable for a web application.
If the code suggests specific UI elements (buttons, forms, lists, cards), try to incorporate abstract representations of them.
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
      return 'https://placehold.co/600x400.png?text=UI+Mockup+Failed';
    } catch (error) {
      console.error('Error during conceptual UI image generation flow:', error);
      return 'https://placehold.co/600x400.png?text=UI+Mockup+Error';
    }
  }
);

