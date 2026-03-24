import React, { useRef, useCallback, useEffect } from 'react';
import { InputBar } from '../shared/InputBar';
import { ChatMessage } from './ChatMessage';
import { InlineDocCard } from './InlineDocCard';
import { useAppStore } from '../../store/appStore';
import { useVersionStore } from '../../store/versionStore';
import { useChatStore } from '../../store/chatStore';
import { useStreamText } from '../../hooks/useStreamText';
import { V2_HTML } from '../../data/sampleContent';
import styles from './ChatPanel.module.css';

interface ChatPanelProps {
  onDeleteDoc: () => void;
  onUndoDelete: () => void;
  docHidden: boolean;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  onDeleteDoc,
  onUndoDelete,
  docHidden,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { isStreaming, setStreaming } = useAppStore();
  const { versions, addVersion, setViewingVersion } = useVersionStore();
  const { messages, addMessage, toggleDeleted } = useChatStore();
  const { abort } = useStreamText();

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  const handleSubmit = useCallback(
    (text: string) => {
      if (isStreaming) return;

      const userId = 'user-' + Date.now();
      addMessage({ id: userId, role: 'user', content: text });

      setStreaming(true);

      const verNum = versions.length + 1;
      const label = `V${verNum} \u2022 Cover letter for Anthropic`;
      const verIdx = addVersion(V2_HTML, label);
      setViewingVersion(verIdx);

      const aiId = 'ai-' + Date.now();
      addMessage({
        id: aiId,
        role: 'ai',
        content:
          'I have thoroughly updated your cover letter to enhance its professionalism. It now conveys your qualifications and experiences in a more polished manner.',
      });

      const docId = 'doc-' + Date.now();
      addMessage({
        id: docId,
        role: 'doc-card',
        content: label,
        versionIdx: verIdx,
        label,
      });

      setTimeout(scrollToBottom, 50);
    },
    [isStreaming, versions.length, addVersion, setViewingVersion, addMessage, setStreaming, scrollToBottom]
  );

  const handleStop = useCallback(() => {
    abort();
    setStreaming(false);
  }, [abort, setStreaming]);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  const initialVersion = versions[0];

  return (
    <>
      <div className={styles.chatScroll} ref={scrollRef}>
        <div className={styles.chatInner}>
          <ChatMessage
            id="initial-user"
            role="user"
            content="Help me draft a cover letter for a role at Anthropic"
            onDelete={() => {}}
          />

          {!docHidden && (
            <div className={styles.msgGroup}>
              <p className={styles.aiLabel}>
                Here is a cover letter generated for your role at anthropic
              </p>
              {initialVersion && (
                <InlineDocCard
                  label={initialVersion.label}
                  versionIdx={0}
                  onNavigate={(idx) => setViewingVersion(idx)}
                  onDelete={onDeleteDoc}
                />
              )}
            </div>
          )}

          {docHidden && (
            <div className={styles.deletedMsg}>
              <span>Message was deleted</span>
              <button className={styles.undoBtn} onClick={onUndoDelete} title="Undo">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 17 4 12 9 7" />
                  <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
                </svg>
              </button>
            </div>
          )}

          {messages.map((msg) => {
            if (msg.deleted) {
              return (
                <div key={msg.id} className={styles.deletedMsg}>
                  <span>Message was deleted</span>
                  <button
                    className={styles.undoBtn}
                    onClick={() => toggleDeleted(msg.id)}
                    title="Undo"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 17 4 12 9 7" />
                      <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
                    </svg>
                  </button>
                </div>
              );
            }

            if (msg.role === 'doc-card') {
              return (
                <InlineDocCard
                  key={msg.id}
                  label={msg.label || msg.content}
                  versionIdx={msg.versionIdx || 0}
                  onNavigate={(idx) => setViewingVersion(idx)}
                />
              );
            }

            return (
              <ChatMessage
                key={msg.id}
                id={msg.id}
                role={msg.role as 'user' | 'ai'}
                content={msg.content}
                onDelete={() => toggleDeleted(msg.id)}
              />
            );
          })}
        </div>
      </div>

      <div className={styles.replyBar}>
        <div className={styles.replyWrap}>
          <InputBar
            variant="reply"
            placeholder="How can I help you?"
            onSubmit={handleSubmit}
            isStreaming={isStreaming}
            onStop={handleStop}
          />
        </div>
        <p className={styles.disclaimer}>
          Claude is AI and can make mistakes. Please double-check responses.
        </p>
      </div>
    </>
  );
};
