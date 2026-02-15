import { useState, useEffect } from "react";

export interface Task {
  id: number;
  words: string;
  correct: string;
  used: boolean;
  type: number;
}

interface Props {
  task: Task;
  onAnswered: () => void;
}

export default function TaskComponent({ task, onAnswered }: Props) {
  const [words, setWords] = useState<string[][]>([]);
  const [correctWords, setCorrectWords] = useState<string[]>([]);
  const [selected, setSelected] = useState<{ [key: string]: string }>({});
  const [answered, setAnswered] = useState(false);

  // Разбираем слова на буквы с индексами
  useEffect(() => {
    const wArr = task.words.split(",");
    const cArr = task.correct.split(",");
    setCorrectWords(cArr);

    const lettersArr: string[][] = wArr.map(word => {
      const counts: { [key: string]: number } = {};
      return word.split("").map(letter => {
        if ("аеёиоуыэюяАЕЁИОУЫЭЮЯ".includes(letter.toLowerCase())) {
          counts[letter] = (counts[letter] || 0) + 1;
          return letter + counts[letter]; // индексируем повторяющиеся гласные
        }
        return letter;
      });
    });

    setWords(lettersArr);
    setSelected({});
    setAnswered(false);
  }, [task]);

  const handleClick = (wordIndex: number, letterIndex: number, letter: string) => {
    if (answered) return;

    const key = `${wordIndex}_${letterIndex}`;
    setSelected(prev => ({ ...prev, [key]: letter }));
  };

  const handleCheck = () => {
    setAnswered(true);
  };

  return (
    <div style={{ marginTop: 20 }}>
      <h2>Поставьте знак ударения в следующих словах:</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 15, marginTop: 20 }}>
        {words.map((wordLetters, wi) => (
          <div key={wi} style={{ display: "flex", gap: 5, justifyContent: "center" }}>
            {wordLetters.map((letter, li) => {
              const baseLetter = letter.replace(/[0-9]/g, "");
              const isSelected = Object.values(selected).includes(letter);
              const isCorrect = answered && task.correct[wi].includes(baseLetter.toUpperCase());
              return (
                <button
                  key={li}
                  onClick={() => handleClick(wi, li, letter)}
                  style={{
                    padding: 5,
                    minWidth: 25,
                    fontWeight: isCorrect ? "bold" : "normal",
                    color: isCorrect ? "red" : isSelected ? "blue" : "black",
                  }}
                >
                  {answered && isCorrect ? baseLetter.toUpperCase() : baseLetter}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {!answered && (
        <button
          onClick={handleCheck}
          style={{ marginTop: 20, padding: "10px 30px", borderRadius: 15, fontSize: 18 }}
        >
          Проверить
        </button>
      )}

      {answered && (
        <button
          onClick={onAnswered}
          style={{ marginTop: 20, padding: "10px 30px", borderRadius: 15, fontSize: 18 }}
        >
          Следующее задание
        </button>
      )}
    </div>
  );
}
