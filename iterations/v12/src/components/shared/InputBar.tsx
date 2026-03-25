import React, { useRef, useCallback, useState, useEffect } from 'react';
import { PlusIcon, VoiceIcon, ArrowUp, StopIcon, ChevronDown } from './Icons';
import styles from './InputBar.module.css';

interface InputBarProps {
  placeholder?: string;
  onSubmit: (text: string) => void;
  disabled?: boolean;
  isStreaming?: boolean;
  onStop?: () => void;
  variant?: 'home' | 'reply';
  selectionCount?: number;
}

export const InputBar: React.FC<InputBarProps> = ({
  placeholder = 'How can I help you today?',
  onSubmit,
  disabled = false,
  isStreaming = false,
  onStop,
  variant = 'home',
  selectionCount,
}) => {
  const textRef = useRef<HTMLTextAreaElement>(null);
  const [hasText, setHasText] = useState(false);

  const autoResize = useCallback(() => {
    const el = textRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 180) + 'px';
  }, []);

  const handleInput = useCallback(() => {
    autoResize();
    setHasText(!!textRef.current?.value.trim());
  }, [autoResize]);

  const handleSubmit = useCallback(() => {
    const text = textRef.current?.value.trim();
    if (!text || disabled) return;
    onSubmit(text);
    if (textRef.current) {
      textRef.current.value = '';
      textRef.current.style.height = 'auto';
    }
    setHasText(false);
  }, [onSubmit, disabled]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  useEffect(() => {
    if (isStreaming && textRef.current) {
      textRef.current.value = '';
      setHasText(false);
    }
  }, [isStreaming]);

  const isReply = variant === 'reply';

  return (
    <div className={`${styles.inputWrap} ${isReply ? styles.replyWrap : ''}`}>
      <div className={styles.inputTop}>
        {selectionCount !== undefined && selectionCount > 0 && (
          <div className={styles.selBadge}>
            <span>{selectionCount}</span> sources
          </div>
        )}
        <textarea
          ref={textRef}
          className={`${styles.inputField} ${isReply ? styles.reply : ''}`}
          placeholder={isStreaming ? 'Generating with love....' : placeholder}
          rows={1}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          disabled={disabled || isStreaming}
        />
      </div>
      <div className={styles.inputTb}>
        <div className={styles.tbLeft}>
          <button
            className={styles.plusIconBtn}
            title="Attach"
            type="button"
          >
            <PlusIcon size={24} />
          </button>
        </div>
        <div className={styles.tbRight}>
          <button className={styles.modelSel} type="button">
            <span className={styles.modelName}>Opus 4.6</span>
            <span className={styles.modelSuffix}> Extended</span>
            <ChevronDown size={16} />
          </button>
          {isStreaming ? (
            <button
              className={`${styles.sendBtn} ${styles.stop}`}
              onClick={onStop}
            >
              <StopIcon />
            </button>
          ) : hasText ? (
            <button
              className={`${styles.sendBtn} ${styles.ready}`}
              onClick={handleSubmit}
            >
              <ArrowUp />
            </button>
          ) : (
            <button className={styles.voiceBtn}>
              <VoiceIcon size={isReply ? 24 : 22} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
