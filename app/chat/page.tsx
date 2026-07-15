'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ChatScenarioSelect from '@/app/components/ChatScenarioSelect';
import ChatWindow from '@/app/components/ChatWindow';
import { ChatMessage } from '@/lib/api';

function ChatPageContent() {
  const searchParams = useSearchParams();
  const resumeScenario = searchParams.get('scenario');
  const resumeMessages = searchParams.get('messages');

  const [selectedScenario, setSelectedScenario] = useState<string | null>(resumeScenario);
  const [initialMessages, setInitialMessages] = useState<ChatMessage[] | undefined>(() => {
    if (resumeMessages) {
      try {
        return JSON.parse(decodeURIComponent(resumeMessages));
      } catch {
        return undefined;
      }
    }
    return undefined;
  });

  if (!selectedScenario) {
    return <ChatScenarioSelect onSelect={(id) => {
      setSelectedScenario(id);
      setInitialMessages(undefined);
    }} />;
  }

  return (
    <ChatWindow
      scenarioId={selectedScenario}
      onBack={() => {
        setSelectedScenario(null);
        setInitialMessages(undefined);
      }}
      initialMessages={initialMessages}
    />
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500" />
      </div>
    }>
      <ChatPageContent />
    </Suspense>
  );
}
