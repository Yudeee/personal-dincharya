"use client";

import { useState, useEffect } from "react";
import { recordReturn } from "@/lib/db/actions";

type Stage = "arrival" | "orientation" | "alignment" | "reflection" | "complete";

type OrientationQuestion = {
  id: string;
  question: string;
  optionA: { label: string; value: string };
  optionB: { label: string; value: string };
};

const orientationQuestions: OrientationQuestion[] = [
  {
    id: "settled",
    question: "Is your body settled or restless?",
    optionA: { label: "Settled", value: "settled" },
    optionB: { label: "Restless", value: "restless" },
  },
  {
    id: "attention",
    question: "Is your attention scattered or collected?",
    optionA: { label: "Scattered", value: "scattered" },
    optionB: { label: "Collected", value: "collected" },
  },
  {
    id: "movement",
    question: "Are you moving or still?",
    optionA: { label: "Moving", value: "moving" },
    optionB: { label: "Still", value: "still" },
  },
  {
    id: "open",
    question: "Do you feel open or guarded?",
    optionA: { label: "Open", value: "open" },
    optionB: { label: "Guarded", value: "guarded" },
  },
];

interface AlignmentPrompt {
  instruction: string;
  duration?: string;
}

const alignmentPrompts: Record<string, AlignmentPrompt[]> = {
  restless: [
    { instruction: "Slow the exhale.\nStay with the breath for 5 rounds." },
    { instruction: "Place both feet flat on the ground.\nFeel the weight settle." },
    { instruction: "Let your shoulders drop.\nNotice what releases." },
  ],
  settled: [
    { instruction: "Stay here.\nThere is nothing to fix." },
    { instruction: "Notice what is already at ease." },
    { instruction: "Let this moment be enough." },
  ],
  scattered: [
    { instruction: "One breath.\nThen another.\nThat's all." },
    { instruction: "Name three things you can see.\nNothing more." },
    { instruction: "Return to the body.\nStart with the hands." },
  ],
  collected: [
    { instruction: "Write one sentence you've been avoiding today." },
    { instruction: "What is asking for your attention?" },
    { instruction: "Let a question arise.\nDon't answer it yet." },
  ],
  moving: [
    { instruction: "Pause.\nLet the body decide the next movement." },
    { instruction: "Soften your pace.\nNotice what shifts." },
  ],
  still: [
    { instruction: "Stay still.\nLet stillness deepen." },
    { instruction: "Notice the breath moving without your effort." },
  ],
  open: [
    { instruction: "What wants to be expressed?" },
    { instruction: "Receive this moment fully." },
  ],
  guarded: [
    { instruction: "You don't have to open.\nJust notice the edges." },
    { instruction: "What are you protecting?\nIt's okay not to know." },
  ],
};

const reflectionPrompts = [
  "What shifted?",
  "What felt true?",
  "What felt resisted?",
];

export function ReturnFlow() {
  const [stage, setStage] = useState<Stage>("arrival");
  const [currentQuestion, setCurrentQuestion] = useState<OrientationQuestion | null>(null);
  const [orientation, setOrientation] = useState<string | null>(null);
  const [alignmentPrompt, setAlignmentPrompt] = useState<AlignmentPrompt | null>(null);
  const [reflectionPrompt, setReflectionPrompt] = useState<string>("");
  const [reflection, setReflection] = useState("");
  const [feeling, setFeeling] = useState<"clear" | "neutral" | "heavy" | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Select random question on mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * orientationQuestions.length);
    setCurrentQuestion(orientationQuestions[randomIndex]);
    const reflectionIndex = Math.floor(Math.random() * reflectionPrompts.length);
    setReflectionPrompt(reflectionPrompts[reflectionIndex]);
  }, []);

  const transition = (nextStage: Stage) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setStage(nextStage);
      setIsTransitioning(false);
    }, 400);
  };

  const handleBegin = () => {
    transition("orientation");
  };

  const handleOrientationChoice = (value: string) => {
    setOrientation(value);
    // Select alignment prompt based on orientation
    const prompts = alignmentPrompts[value] || alignmentPrompts.settled;
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    setAlignmentPrompt(randomPrompt);
    transition("alignment");
  };

  const handleAlignmentComplete = () => {
    transition("reflection");
  };

  const handleSkipReflection = async () => {
    await saveReturn();
    transition("complete");
  };

  const handleReflectionComplete = async () => {
    await saveReturn();
    transition("complete");
  };

  const saveReturn = async () => {
    if (!orientation) return;
    await recordReturn({
      orientation,
      feeling: feeling || undefined,
      reflection: reflection.trim() || undefined,
    });
  };

  const containerClass = `flex-1 flex flex-col items-center justify-center px-6 max-w-md mx-auto w-full transition-opacity duration-400 ${
    isTransitioning ? "opacity-0" : "opacity-100"
  }`;

  if (stage === "arrival") {
    return (
      <div className={containerClass}>
        <div className="text-center space-y-12 fade-in">
          <p className="text-2xl md:text-3xl text-earth font-serif leading-relaxed">
            You're here.<br />
            That's enough.
          </p>
          <button onClick={handleBegin} className="btn-primary fade-in-delayed">
            Begin
          </button>
        </div>
      </div>
    );
  }

  if (stage === "orientation" && currentQuestion) {
    return (
      <div className={containerClass}>
        <div className="w-full space-y-12 fade-in">
          <p className="text-2xl md:text-3xl text-earth font-serif text-center leading-relaxed">
            {currentQuestion.question}
          </p>
          <div className="space-y-4 fade-in-delayed">
            <button
              onClick={() => handleOrientationChoice(currentQuestion.optionA.value)}
              className="btn-choice"
            >
              {currentQuestion.optionA.label}
            </button>
            <button
              onClick={() => handleOrientationChoice(currentQuestion.optionB.value)}
              className="btn-choice"
            >
              {currentQuestion.optionB.label}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === "alignment" && alignmentPrompt) {
    return (
      <div className={containerClass}>
        <div className="w-full space-y-16 fade-in">
          <p className="text-2xl md:text-3xl text-earth font-serif text-center leading-relaxed whitespace-pre-line">
            {alignmentPrompt.instruction}
          </p>
          <div className="flex justify-center fade-in-delayed">
            <button onClick={handleAlignmentComplete} className="btn-primary">
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === "reflection") {
    return (
      <div className={containerClass}>
        <div className="w-full space-y-10 fade-in">
          <p className="text-xl md:text-2xl text-earth font-serif text-center">
            {reflectionPrompt}
          </p>

          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="Optional..."
            rows={3}
            className="reflection-input fade-in-delayed"
          />

          <div className="flex justify-center gap-3 fade-in-delayed">
            {(["clear", "neutral", "heavy"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFeeling(feeling === f ? null : f)}
                className={`word-choice ${feeling === f ? "word-choice-selected" : ""}`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex justify-center gap-4 pt-4 fade-in-delayed">
            <button onClick={handleSkipReflection} className="btn-subtle">
              Skip
            </button>
            <button onClick={handleReflectionComplete} className="btn-primary">
              Complete
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === "complete") {
    return (
      <div className={containerClass}>
        <div className="text-center space-y-6 fade-in-slow">
          <p className="text-xl md:text-2xl text-earth-muted font-serif">
            Return whenever you need.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
