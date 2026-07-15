'use client';

import { useState, useEffect } from 'react';
import ChatScenarioSelect from '@/app/components/ChatScenarioSelect';
import ChatWindow from '@/app/components/ChatWindow';
import { ChatMessage } from '@/lib/api';

export default function ChatPage() {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [initialMessages, setInitialMessages] = useState<ChatMessage[] | undefined>(undefined);
  const [resumeSessionId, setResumeSessionId] = useState<string | undefined>(undefined);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('bhs_resume_chat');
    if (raw) {
      localStorage.removeItem('bhs_resume_chat');
      try {
        const data = JSON.parse(raw);
        setSelectedScenario(data.scenarioId);
        setInitialMessages(data.messages);
        setResumeSessionId(data.sessionId);
      } catch {
        // パース失敗は無視
      }
    }
    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500" />
      </div>
    );
  }

  if (!selectedScenario) {
    return <ChatScenarioSelect onSelect={setSelectedScenario} />;
  }

  return (
    <ChatWindow
      scenarioId={selectedScenario}
      onBack={() => {
        setSelectedScenario(null);
        setInitialMessages(undefined);
        setResumeSessionId(undefined);
      }}
      initialMessages={initialMessages}
      resumeSessionId={resumeSessionId}
    />
  );
}
