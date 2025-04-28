"use client";
import { useState } from 'react';

export default function StoryPage() {
  const [currentStep, setCurrentStep] = useState(1);

  const storySteps = [
    {
      title: "Welcome to Bug Tracker",
      content: "A modern solution for tracking and managing software issues efficiently."
    },
    {
      title: "Track Issues",
      content: "Create, update and monitor bugs and tasks in real-time. Keep your development process organized."
    },
    {
      title: "Collaborate",
      content: "Work together with your team. Assign tasks, add comments, and resolve issues collaboratively."
    },
    {
      title: "Analyze",
      content: "Get insights into your project's progress with detailed statistics and trend analysis."
    }
  ];

  const nextStep = () => {
    if (currentStep < storySteps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-lg">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {storySteps[currentStep - 1].title}
          </h1>
          <p className="text-lg text-gray-600">
            {storySteps[currentStep - 1].content}
          </p>
        </div>
        
        <div className="flex justify-between items-center">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`px-4 py-2 rounded ${
              currentStep === 1 
                ? 'bg-gray-200 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            Previous
          </button>
          
          <div className="text-sm text-gray-500">
            Step {currentStep} of {storySteps.length}
          </div>
          
          <button
            onClick={nextStep}
            disabled={currentStep === storySteps.length}
            className={`px-4 py-2 rounded ${
              currentStep === storySteps.length
                ? 'bg-gray-200 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
