'use client';

import { useState } from 'react';
import ChatScenarioSelect from '@/app/components/ChatScenarioSelect';
import ChatWindow from '@/app/components/ChatWindow';
import { ChatMessage } from '@/lib/api';

export default function ChatPage() {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const resume = localStorage.getItem('bhs_resume_chat');
    if (resume) {
      try {
        const data = JSON.parse(resume);
        return data.scenarioId ?? null;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [initialMessages] = useState<ChatMessage[] | undefined>(() => {
    if (typeof window === 'undefined') return undefined;
    const resume = localStorage.getItem('bhs_resume_chat');
    if (resume) {
      localStorage.removeItem('bhs_resume_chat');
      try {
        const data = JSON.parse(resume);
        return data.messages;
      } catch {
        return undefined;
      }
    }
    return undefined;
  });

  if (!selectedScenario) {
    return <ChatScenarioSelect onSelect={setSelectedScenario} />;
  }

  return (
    <ChatWindow
      scenarioId={selectedScenario}
      onBack={() => setSelectedScenario(null)}
      initialMessages={initialMessages}
    />
  );
}
