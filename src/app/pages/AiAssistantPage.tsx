import React from "react";
import { useNavigate } from "react-router";
import { AppLayout } from "../components/layout/AppLayout";
import { DollChatboxWindow } from "../components/ai/PathaSathiDollAssistant";

export function AiAssistantPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/feed");
    }
  };

  return (
    <AppLayout noPad hideNav={true} activeTab="assistant">
      <div className="w-full h-full flex flex-col bg-slate-50">
        <DollChatboxWindow
          isOpen={true}
          onClose={handleBack}
          fullPage={true}
        />
      </div>
    </AppLayout>
  );
}
export default AiAssistantPage;
