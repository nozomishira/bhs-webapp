'use client';

import { useState } from 'react';
import ChatScenarioSelect from '@/app/components/ChatScenarioSelect';
import ChatWindow from '@/app/components/ChatWindow';
import { ChatMessage } from '@/lib/api';

interface ResumeData {
  scenarioId: string;
  messages: ChatMessage[];
  sessionId?: string;
}

function getResumeData(): ResumeData | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('bhs_resume_chat');
  if (!raw) return null;
  localStorage.removeItem('bhs_resume_chat');
  try {
    return JSON.parse(raw) as ResumeData;
  } catch {
    return null;
  }
}

export default function ChatPage() {
  const [resumeData] = useState<ResumeData | null>(getResumeData);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(resumeData?.scenarioId ?? null);

  if (!selectedScenario) {
    return <ChatScenarioSelect onSelect={setSelectedScenario} />;
  }

  return (
    <ChatWindow
      scenarioId={selectedScenario}
      onBack={() => setSelectedScenario(null)}
      initialMessages={resumeData?.messages}
      resumeSessionId={resumeData?.sessionId}
    />
  );
}
