
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { generateProjectPlan, type GenerateProjectPlanOutput } from "@/ai/flows/project-plan-generator";
import { generateFlowchart } from "@/ai/flows/flowchart-generator";
import { generateReactCode, type GenerateReactCodeOutput } from "@/ai/flows/react-code-generator";
import { generateImage, type GenerateConceptualUiImageOutput } from "@/ai/flows/image-generator-flow";
import { 
  generateProjectInsights, 
  type ProjectInsightsOutput 
} from "@/ai/flows/project-insights-generator";
import { LoadingSpinner } from "./loading-spinner";
import { SectionCard } from "./section-card";
import { FlowchartDisplay } from "./flowchart-display";
import { CodeDisplay } from "./code-display";
import { ListChecks, GitFork, Code2, Wand2, Image as ImageIcon, Lightbulb } from "lucide-react";

export function GenCraftForm() {
  const [projectIdea, setProjectIdea] = useState("");
  const [projectPlan, setProjectPlan] = useState<GenerateProjectPlanOutput | null>(null);
  const [flowchartSvg, setFlowchartSvg] = useState<string | null>(null);
  const [reactCode, setReactCode] = useState<GenerateReactCodeOutput | null>(null);
  const [generatedImageDataUri, setGeneratedImageDataUri] = useState<GenerateConceptualUiImageOutput | null>(null);
  const [projectInsights, setProjectInsights] = useState<ProjectInsightsOutput | null>(null);

  const [isLoadingPlan, setIsLoadingPlan] = useState(false);
  const [isLoadingFlowchart, setIsLoadingFlowchart] = useState(false);
  const [isLoadingCode, setIsLoadingCode] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!projectIdea.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter your project idea.",
        variant: "destructive",
      });
      return;
    }

    setProjectPlan(null);
    setFlowchartSvg(null);
    setReactCode(null);
    setGeneratedImageDataUri(null);
    setProjectInsights(null);

    setIsLoadingPlan(true);
    try {
      const plan = await generateProjectPlan({ projectIdea });
      setProjectPlan(plan);
      toast({ title: "Project Plan Generated!", variant: "default" });

      setIsLoadingFlowchart(true);
      try {
        const flowchart = await generateFlowchart(projectIdea);
        setFlowchartSvg(flowchart);
        toast({ title: "Flowchart Generated!", variant: "default" });
        
        setIsLoadingCode(true);
        let generatedCodeOutput: GenerateReactCodeOutput | null = null;
        try {
          const code = await generateReactCode({
            projectIdea,
            projectPlan: JSON.stringify(plan), 
            flowchart,
          });
          setReactCode(code);
          generatedCodeOutput = code; 
          toast({ title: "React Code Generated!", variant: "default" });
        } catch (error) {
          console.error("Error generating React code:", error);
          toast({
            title: "Code Generation Failed",
            description: "Could not generate React code. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsLoadingCode(false);
        }

        if (generatedCodeOutput && generatedCodeOutput.starterCode) {
            setIsLoadingImage(true);
            let imageGeneratedSuccessfully = false;
            try {
              const imageOutput = await generateImage({ 
                projectIdea, 
                generatedCode: generatedCodeOutput.starterCode 
              });
              setGeneratedImageDataUri(imageOutput);
              toast({ title: "Conceptual App Image Generated!", variant: "default" });
              imageGeneratedSuccessfully = true;
            } catch (error) {
              console.error("Error generating app image:", error);
              toast({
                title: "Image Generation Failed",
                description: "Could not generate a conceptual image. Please try again.",
                variant: "destructive",
              });
            } finally {
              setIsLoadingImage(false);
            }

            // Generate insights regardless of image generation success, if code was generated
            setIsLoadingInsights(true);
            try {
              const insights = await generateProjectInsights({
                projectIdea,
                projectPlan: JSON.stringify(plan),
                generatedCode: generatedCodeOutput.starterCode,
              });
              setProjectInsights(insights);
              toast({ title: "Project Insights Generated!", variant: "default" });
            } catch (error) {
              console.error("Error generating project insights:", error);
              toast({
                title: "Insights Generation Failed",
                description: "Could not generate project insights.",
                variant: "destructive",
              });
            } finally {
              setIsLoadingInsights(false);
            }
        }

      } catch (error) {
        console.error("Error generating flowchart:", error);
        toast({
          title: "Flowchart Generation Failed",
          description: "Could not generate flowchart. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingFlowchart(false);
      }
    } catch (error) {
      console.error("Error generating project plan:", error);
      toast({
        title: "Project Plan Generation Failed",
        description: "Could not generate project plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPlan(false);
    }
  };

  const isGenerating = isLoadingPlan || isLoadingFlowchart || isLoadingCode || isLoadingImage || isLoadingInsights;

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <header className="mb-12 text-center">
        <h1 className="font-headline text-5xl font-bold text-primary flex items-center justify-center">
          <Wand2 className="mr-3 h-12 w-12" />
          GenCraft
        </h1>
        <p className="text-muted-foreground text-lg mt-2 font-body">
          AI Project & Code Generator (Demo)
        </p>
      </header>

      <Card className="mb-8 shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary">Describe Your Project</CardTitle>
          <CardDescription className="font-body">
            Enter your project idea in natural language (e.g., "Create a weather dashboard").
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Textarea
              placeholder="e.g., A simple to-do list application with user authentication..."
              value={projectIdea}
              onChange={(e) => setProjectIdea(e.target.value)}
              rows={4}
              className="border-primary focus:ring-accent"
              disabled={isGenerating}
            />
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-headline text-lg py-6" disabled={isGenerating}>
              {isGenerating ? (
                <LoadingSpinner className="mr-2" />
              ) : (
                <Wand2 className="mr-2 h-5 w-5" />
              )}
              Craft Project
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-8">
        {isLoadingPlan && !projectPlan && (
          <SectionCard title="Generating Project Plan..." icon={ListChecks}>
            <div className="flex justify-center p-8">
              <LoadingSpinner size={48} />
            </div>
          </SectionCard>
        )}
        {projectPlan && (
          <SectionCard title="Project Plan" icon={ListChecks}>
            <ul className="space-y-3 list-disc list-inside">
              <li><strong className="font-medium">Milestone 1:</strong> {projectPlan.milestone1}</li>
              <li><strong className="font-medium">Milestone 2:</strong> {projectPlan.milestone2}</li>
              <li><strong className="font-medium">Milestone 3:</strong> {projectPlan.milestone3}</li>
            </ul>
            {isLoadingFlowchart && !flowchartSvg && (
              <div className="mt-6 flex flex-col items-center p-4 border-t border-dashed">
                 <p className="text-sm text-muted-foreground mb-2">Generating Flowchart...</p>
                <LoadingSpinner size={36} />
              </div>
            )}
          </SectionCard>
        )}

        {flowchartSvg && (
          <SectionCard title="Flowchart" icon={GitFork} contentClassName="p-0 sm:p-2 md:p-4">
             <FlowchartDisplay svgString={flowchartSvg} className="bg-white dark:bg-gray-800 shadow-inner" />
             {isLoadingCode && !reactCode && (
              <div className="mt-6 flex flex-col items-center p-4 border-t border-dashed">
                <p className="text-sm text-muted-foreground mb-2">Generating React Code...</p>
                <LoadingSpinner size={36} />
              </div>
            )}
          </SectionCard>
        )}
        
        {reactCode && (
          <SectionCard title="Starter React Code" icon={Code2} contentClassName="p-0">
            <CodeDisplay code={reactCode.starterCode} />
             {isLoadingImage && !generatedImageDataUri && (
              <div className="mt-6 flex flex-col items-center p-4 border-t border-dashed">
                <p className="text-sm text-muted-foreground mb-2">Generating Conceptual App Image...</p>
                <LoadingSpinner size={36} />
              </div>
            )}
          </SectionCard>
        )}

        {generatedImageDataUri && (
          <SectionCard title="Suggested App Image" icon={ImageIcon}>
            <div className="flex justify-center items-center p-4 bg-muted dark:bg-slate-800 rounded-md">
              <img 
                src={generatedImageDataUri} 
                alt="Generated Conceptual App UI Image" 
                className="max-w-full h-auto max-h-96 rounded-lg shadow-md object-contain"
                data-ai-hint="UI mockup"
              />
            </div>
            {isLoadingInsights && !projectInsights && (
              <div className="mt-6 flex flex-col items-center p-4 border-t border-dashed">
                <p className="text-sm text-muted-foreground mb-2">Generating Project Insights...</p>
                <LoadingSpinner size={36} />
              </div>
            )}
          </SectionCard>
        )}
        
        {projectInsights && (
          <SectionCard title="Project Insights" icon={Lightbulb}>
            <div className="space-y-3">
              <p><strong className="font-medium">Estimated Complexity:</strong> {projectInsights.estimatedComplexity}</p>
              <div>
                <strong className="font-medium">Suggested Keywords:</strong>
                {projectInsights.suggestedKeywords && projectInsights.suggestedKeywords.length > 0 ? (
                  <ul className="list-disc list-inside ml-4 mt-1">
                    {projectInsights.suggestedKeywords.map((keyword, index) => (
                      <li key={index}>{keyword}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="ml-2 text-muted-foreground">None suggested.</span>
                )}
              </div>
              <p><strong className="font-medium">Fun Fact/Tip:</strong> {projectInsights.funFactOrTip}</p>
            </div>
          </SectionCard>
        )}
      </div>
    </div>
  );
}
