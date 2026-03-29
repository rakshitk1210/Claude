import React, { useRef, useCallback, useEffect } from 'react';
import { InputBar } from '../shared/InputBar';
import { ChatMessage } from './ChatMessage';
import { InlineDocCard } from './InlineDocCard';
import { useAppStore } from '../../store/appStore';
import { useVersionStore } from '../../store/versionStore';
import { useChatStore } from '../../store/chatStore';
import { streamChat } from '../../api/streamChat';
import { documentRevise } from '../../api/documentRevise';
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
  const abortRef = useRef<AbortController | null>(null);
  const { isStreaming, setStreaming, homePrompt } = useAppStore();
  const { versions, setViewingVersion, addVersion } = useVersionStore();
  const { messages, addMessage, appendToMessage, updateMessage, toggleDeleted } = useChatStore();

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

      const aiId = 'ai-' + Date.now();
      addMessage({ id: aiId, role: 'ai', content: '' });

      setStreaming(true);
      setTimeout(scrollToBottom, 50);

      const allMessages = useChatStore.getState().messages;
      const apiMessages = allMessages
        .filter((m) => !m.deleted && (m.role === 'user' || m.role === 'ai') && m.content)
        .map((m) => ({
          role: (m.role === 'ai' ? 'assistant' : 'user') as 'user' | 'assistant',
          content: m.content,
        }));

      const seedContent = homePrompt.trim() || 'Document request';
      const seedMessage = { role: 'user' as const, content: seedContent };
      const payload = [seedMessage, ...apiMessages];

      const controller = new AbortController();
      abortRef.current = controller;

      streamChat(payload, {
        signal: controller.signal,
        onDelta: (chunk) => {
          appendToMessage(aiId, chunk);
          scrollToBottom();
        },
        onDone: () => {
          abortRef.current = null;

          const { versions: curVersions, viewingVersion } = useVersionStore.getState();
          const currentVersion = curVersions[viewingVersion];
          if (!currentVersion) {
            setStreaming(false);
            return;
          }
          const currentHtml = currentVersion.revisions[currentVersion.currentRevision];

          documentRevise(currentHtml, text)
            .then((revisedHtml) => {
              const verNum = curVersions.length + 1;
              const label = `Version ${verNum}`;
              const verIdx = addVersion(revisedHtml, label);
              setViewingVersion(verIdx);

              const docId = 'doc-' + Date.now();
              addMessage({
                id: docId,
                role: 'doc-card',
                content: label,
                versionIdx: verIdx,
                label,
              });
              setTimeout(scrollToBottom, 50);
            })
            .catch(() => {
              // doc revision failed silently; chat reply is still there
            })
            .finally(() => {
              setStreaming(false);
            });
        },
        onError: (error) => {
          updateMessage(aiId, `Error: ${error}`);
          setStreaming(false);
          abortRef.current = null;
        },
      });
    },
    [
      isStreaming,
      homePrompt,
      addMessage,
      appendToMessage,
      updateMessage,
      setStreaming,
      scrollToBottom,
      addVersion,
      setViewingVersion,
    ]
  );

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStreaming(false);
  }, [setStreaming]);

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
            content={homePrompt.trim() || 'Your request'}
            onDelete={() => {}}
          />

          {!docHidden && (
            <div className={styles.msgGroup}>
              <p className={styles.aiLabel}>
                Here&apos;s your generated document.
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
