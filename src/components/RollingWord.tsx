import React from 'react';

interface RollingWordProps {
  word: string;
  className?: string;
  warpable?: boolean;
}

export const RollingWord: React.FC<RollingWordProps> = ({
  word,
  className = '',
  warpable = false,
}) => {
  if (!warpable) {
    return (
      <span className={`roll-word ${className}`} data-word={word}>
        <span className="roll-word-primary">{word}</span>
        <span className="roll-word-secondary" aria-hidden="true">
          {word}
        </span>
      </span>
    );
  }

  const chars = Array.from(word);

  return (
    <span className={`roll-word ${className}`} data-word={word} data-warpable="true">
      <span className="roll-word-primary">
        {chars.map((char, i) => (
          <span
            key={i}
            className="hero-warp-char inline-block"
            data-char={char}
            data-char-idx={i}
          >
            {char}
          </span>
        ))}
      </span>
      <span className="roll-word-secondary" aria-hidden="true">
        {chars.map((char, i) => (
          <span
            key={i}
            className="hero-warp-char inline-block"
            data-char={char}
            data-char-idx={i}
          >
            {char}
          </span>
        ))}
      </span>
    </span>
  );
};
