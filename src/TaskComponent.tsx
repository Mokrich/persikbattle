import { useState } from "react";

export interface Task {
  id: number;
  words: string;
  correct: string;
  type: number;
}

interface Props {
  task: Task;
  onAnswered: (isCorrect: boolean) => void;
}

export default function TaskComponent({ task, onAnswered }: Props) {
  const wordsArray = task.words.split(",").map(w => w.trim());
  const correctArray = task.correct.split(",").map(c => c.trim());

  const [selected, setSelected] = useState<string[]>(wordsArray.map(() => ""));
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const vowels = "аеёиоуыэюя";

  const handleClick = (wordIndex: number, charIndex: number) => {
    if (showAnswer) return;

    const char = wordsArray[wordIndex][charIndex];
    if (!vowels.includes(char.toLowerCase())) return;

    const newSelected = [...selected];
    newSelected[wordIndex] = char;
    setSelected(newSelected);
  };

  const handleCheck = () => {
    let correct = true;

    wordsArray.forEach((word, i) => {
      const correctWord = correctArray[i];

      const correctLetter = correctWord
        .split("")
        .find(ch => ch === ch.toUpperCase());

      if (selected[i] !== correctLetter?.toLowerCase()) {
        correct = false;
      }
    });

    setIsCorrect(correct);
    setShowAnswer(true);
  };

  const handleNext = () => {
    onAnswered(isCorrect === true);
  };

  return (
    <div style={{ marginTop: 30 }}>
      <h2>Поставьте ударение:</h2>

      {wordsArray.map((word, i) => (
        <div key={i} style={{ fontSize: 26, margin: "15px 0" }}>
          {word.split("").map((ch, ci) => {
            const isVowel = vowels.includes(ch.toLowerCase());

            let displayChar = ch;
            let color = "black";

            if (!showAnswer && selected[i] === ch) {
              displayChar = ch.toUpperCase();
              color = "orange";
            }

            if (showAnswer) {
              const correctWord = correctArray[i];
              if (correctWord[ci] === correctWord[ci].toUpperCase()) {
                displayChar = ch.toUpperCase();
                color = "green";
              }
            }

            return (
              <span
                key={ci}
                onClick={() => handleClick(i, ci)}
                style={{
                  cursor: isVowel && !showAnswer ? "pointer" : "default",
                  marginRight: 2,
                  color,
                  fontWeight:
                    displayChar === displayChar.toUpperCase()
                      ? "bold"
                      : "normal"
                }}
              >
                {displayChar}
              </span>
            );
          })}
        </div>
      ))}

      {!showAnswer && (
        <button onClick={handleCheck}>
          Проверить
        </button>
      )}

      {showAnswer && (
        <>
          <h3>
            {isCorrect ? "✅ Верно!" : "❌ Неверно"}
          </h3>
          <button onClick={handleNext}>
            Следующее задание →
          </button>
        </>
      )}
    </div>
  );
}
