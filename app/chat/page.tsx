'use client';

import { useState } from 'react';
import ChatScenarioSelect from '@/app/components/ChatScenarioSelect';
import ChatWindow from '@/app/components/ChatWindow';

export default function ChatPage() {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  if (!selectedScenario) {
    return <ChatScenarioSelect onSelect={setSelectedScenario} />;
  }

  return (
    <ChatWindow
      scenarioId={selectedScenario}
      onBack={() => setSelectedScenario(null)}
    />
  );
}
