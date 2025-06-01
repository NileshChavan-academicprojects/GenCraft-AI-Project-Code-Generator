
'use server';
/**
 * @fileOverview Generates an image based on a textual description.
 *
 * - generateImage - A function that handles the image generation process.
 * - GenerateImageInput - The input type for the generateImage function.
 * - GenerateImageOutput - The return type for the generateImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImageInputSchema = z.string().describe('A textual description or idea to generate an image from.');
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.string().describe('The generated image as a data URI string.');
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

export async function generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
  return generateImageFlow(input);
}

const generateImageFlow = ai.defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: GenerateImageInputSchema,
    outputSchema: GenerateImageOutputSchema,
  },
  async (description) => {
    try {
      const {media} = await ai.generate({
        model: 'googleai/gemini-2.0-flash-exp',
        prompt: `Generate a visually appealing and relevant image that represents the concept: "${description}". The style should be suitable for a modern web application. If possible, subtly include an element from the description in the image. Ensure the image is safe for all audiences.`,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      });

      if (media && media.url) {
        return media.url;
      }
      console.warn('Image generation succeeded but media URL was not found. Returning placeholder.');
      // Fallback to a placeholder if media.url is not available for some reason
      return 'https://placehold.co/600x400.png?text=Image+Generation+Failed';
    } catch (error) {
      console.error('Error during image generation flow:', error);
      // Return a placeholder or an error indicator string
      return 'https://placehold.co/600x400.png?text=Image+Generation+Error';
    }
  }
);
