
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { generateProjectPlan, type GenerateProjectPlanOutput } from "@/ai/flows/project-plan-generator";
import { generateReactCode, type GenerateReactCodeOutput } from "@/ai/flows/react-code-generator";
import { generateImage, type GenerateConceptualUiImageOutput } from "@/ai/flows/image-generator-flow";
import {
  generateProjectInsights,
  type ProjectInsightsOutput
} from "@/ai/flows/project-insights-generator";
import {
  generateStrategicAdvice,
  type StrategicAdviceOutput
} from "@/ai/flows/strategic-advice-generator";
import { LoadingSpinner } from "./loading-spinner";
import { SectionCard } from "./section-card";
import { CodeDisplay } from "./code-display";
import { ListChecks, Code2, Wand2, Image as ImageIcon, Lightbulb, FileText, Palette, Brain } from "lucide-react";

export function GenCraftForm() {
  const [projectIdea, setProjectIdea] = useState("");
  const [projectPlan, setProjectPlan] = useState<GenerateProjectPlanOutput | null>(null);
  const [strategicAdvice, setStrategicAdvice] = useState<StrategicAdviceOutput | null>(null);
  const [reactCode, setReactCode] = useState<GenerateReactCodeOutput | null>(null);
  const [generatedImageDataUri, setGeneratedImageDataUri] = useState<GenerateConceptualUiImageOutput | null>(null);
  const [projectInsights, setProjectInsights] = useState<ProjectInsightsOutput | null>(null);

  const [isLoadingPlan, setIsLoadingPlan] = useState(false);
  const [isLoadingStrategicAdvice, setIsLoadingStrategicAdvice] = useState(false);
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

    // Reset all states
    setProjectPlan(null);
    setStrategicAdvice(null);
    setReactCode(null);
    setGeneratedImageDataUri(null);
    setProjectInsights(null);

    // Step 1: Generate Project Plan
    setIsLoadingPlan(true);
    let plan: GenerateProjectPlanOutput | null = null;
    try {
      plan = await generateProjectPlan({ projectIdea });
      setProjectPlan(plan);
      toast({ title: "Project Plan Generated!", variant: "default" });
    } catch (error) {
      console.error("Error generating project plan:", error);
      toast({
        title: "Project Plan Generation Failed",
        description: "Could not generate project plan. Please try again.",
        variant: "destructive",
      });
      setIsLoadingPlan(false);
      return;
    } finally {
      setIsLoadingPlan(false);
    }

    // Step 2: Generate Strategic Advice (to guide code generation)
    setIsLoadingStrategicAdvice(true);
    let adviceResult: StrategicAdviceOutput | null = null;
    try {
      if (plan) {
        adviceResult = await generateStrategicAdvice({
            projectIdea,
            projectPlan: JSON.stringify(plan),
        });
        setStrategicAdvice(adviceResult);
        toast({ title: "Strategic Advice Generated!", variant: "default" });
      } else {
         throw new Error("Plan missing for strategic advice generation.");
      }
    } catch (error) {
        console.error("Error generating strategic advice:", error);
        toast({
            title: "Strategic Advice Generation Failed",
            description: "Could not generate strategic advice to guide coding.",
            variant: "destructive",
        });
        setIsLoadingStrategicAdvice(false);
        return;
    } finally {
        setIsLoadingStrategicAdvice(false);
    }


    // Step 3: Generate React Code
    setIsLoadingCode(true);
    let generatedCodeOutput: GenerateReactCodeOutput | null = null;
    try {
      if (plan && adviceResult) {
        generatedCodeOutput = await generateReactCode({
          projectIdea,
          projectPlan: JSON.stringify(plan),
          strategicAdvice: JSON.stringify(adviceResult),
        });
        setReactCode(generatedCodeOutput);
        toast({ title: "React Code & Styles Generated!", variant: "default" });
      } else {
        throw new Error("Plan or strategic advice missing for code generation.");
      }
    } catch (error) {
      console.error("Error generating React code:", error);
      toast({
        title: "Code Generation Failed",
        description: "Could not generate React code. Please try again.",
        variant: "destructive",
      });
      setIsLoadingCode(false);
      return;
    } finally {
      setIsLoadingCode(false);
    }

    let representativeCodeForDownstream = "";
    if (generatedCodeOutput?.files && generatedCodeOutput.files.length > 0) {
      representativeCodeForDownstream = generatedCodeOutput.files
        .map(file => `// --- File: ${file.fileName} ---\n${file.fileContent}`)
        .join('\n\n// --- End File ---\n\n');
    } else {
        toast({
            title: "Code Generation Note",
            description: "No files were generated, subsequent steps might be affected.",
            variant: "default",
        });
        // Allow continuing if plan and advice are present, image/insights might still be useful
    }

    // Step 4: Generate Conceptual UI Image
    setIsLoadingImage(true);
    try {
      const imageOutput = await generateImage({
        generatedCode: representativeCodeForDownstream // Can be empty if no code generated
      });
      setGeneratedImageDataUri(imageOutput);
      toast({ title: "Conceptual App Image Generated!", variant: "default" });
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

    // Step 5: Generate Project Insights
    setIsLoadingInsights(true);
    try {
      if(plan){ // Insights primarily depend on plan and idea
        const insights = await generateProjectInsights({
            projectIdea,
            projectPlan: JSON.stringify(plan),
            generatedCode: representativeCodeForDownstream, // Can be empty
        });
        setProjectInsights(insights);
        toast({ title: "Project Insights Generated!", variant: "default" });
      }
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
  };

  const isAnyStepLoading = isLoadingPlan || isLoadingStrategicAdvice || isLoadingCode || isLoadingImage || isLoadingInsights;

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
              disabled={isAnyStepLoading}
            />
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-headline text-lg py-6" disabled={isAnyStepLoading}>
              {isAnyStepLoading ? (
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
        {/* Loading Indicators Section */}
        {isLoadingPlan && (
          <SectionCard title="Generating Project Plan..." icon={ListChecks}>
            <div className="flex justify-center p-8">
              <LoadingSpinner size={48} />
            </div>
          </SectionCard>
        )}
        {projectPlan && isLoadingStrategicAdvice && !strategicAdvice && (
           <SectionCard title="Deep Thinking for Strategic Code Guidance..." icon={Brain}>
            <div className="flex justify-center p-8">
              <LoadingSpinner size={48} />
            </div>
          </SectionCard>
        )}
        {strategicAdvice && isLoadingCode && !reactCode && (
          <SectionCard title="Generating React Code & Styles (with guidance)..." icon={Code2}>
            <div className="flex justify-center p-8">
              <LoadingSpinner size={48} />
            </div>
          </SectionCard>
        )}
        {reactCode && isLoadingImage && !generatedImageDataUri && (
           <SectionCard title="Generating App UI Image..." icon={ImageIcon}>
            <div className="flex justify-center p-8">
              <LoadingSpinner size={48} />
            </div>
          </SectionCard>
        )}
        {generatedImageDataUri && isLoadingInsights && !projectInsights && (
           <SectionCard title="Generating Project Insights..." icon={Lightbulb}>
            <div className="flex justify-center p-8">
              <LoadingSpinner size={48} />
            </div>
          </SectionCard>
        )}


        {/* Results Section */}
        {projectPlan && !isLoadingPlan && (
          <SectionCard
            title="Project Plan"
            icon={ListChecks}
            className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out"
          >
            <ul className="space-y-3 list-disc list-inside">
              <li><strong className="font-medium">Milestone 1:</strong> {projectPlan.milestone1}</li>
              <li><strong className="font-medium">Milestone 2:</strong> {projectPlan.milestone2}</li>
              <li><strong className="font-medium">Milestone 3:</strong> {projectPlan.milestone3}</li>
            </ul>
          </SectionCard>
        )}

        {strategicAdvice && !isLoadingStrategicAdvice && (
          <SectionCard
            title="Strategic Advice (Guiding Code Generation)"
            icon={Brain}
            className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out"
          >
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-primary">Key Consideration for Dev:</h4>
                <p className="text-sm text-muted-foreground">{strategicAdvice.keyConsideration}</p>
              </div>
              <div>
                <h4 className="font-semibold text-primary">Suggested First Coding Step:</h4>
                <p className="text-sm text-muted-foreground">{strategicAdvice.nextStepSuggestion}</p>
              </div>
              <div>
                <h4 className="font-semibold text-primary">Potential Dev Challenge:</h4>
                <p className="text-sm text-muted-foreground">{strategicAdvice.potentialChallenge}</p>
              </div>
              <div>
                <h4 className="font-semibold text-primary">Long-Term Architectural Thought:</h4>
                <p className="text-sm text-muted-foreground">{strategicAdvice.longTermThought}</p>
              </div>
            </div>
          </SectionCard>
        )}

        {reactCode && reactCode.files && reactCode.files.length > 0 && !isLoadingCode && (
          <SectionCard
            title="Generated React Files"
            icon={Code2}
            contentClassName="space-y-6"
            className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out"
          >
            {reactCode.files.map((file, index) => (
              <div key={index}>
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-primary" />
                  {file.fileName}
                </h3>
                <CodeDisplay code={file.fileContent} language="tsx" />
              </div>
            ))}
          </SectionCard>
        )}

        {reactCode && reactCode.globalStyles && !isLoadingCode && (
           <SectionCard
            title="Suggested Global Styles"
            icon={Palette}
            contentClassName="p-0"
            className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out"
           >
            <CodeDisplay code={reactCode.globalStyles} language="css" />
          </SectionCard>
        )}

        {generatedImageDataUri && !isLoadingImage && (
          <SectionCard
            title="App UI Image"
            icon={ImageIcon}
            className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out"
          >
            <div className="flex justify-center items-center p-4 bg-muted dark:bg-slate-800 rounded-md">
              <img
                src={generatedImageDataUri}
                alt="Generated Conceptual App UI Image"
                className="max-w-full h-auto max-h-96 rounded-lg shadow-md object-contain"
                data-ai-hint="UI mockup"
              />
            </div>
          </SectionCard>
        )}

        {projectInsights && !isLoadingInsights && (
          <SectionCard
            title="Project Insights"
            icon={Lightbulb}
            className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out"
          >
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

