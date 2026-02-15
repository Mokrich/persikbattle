import { useState } from "react";

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
  const wordsArray = task.words.split(",").map(w => w.trim());
  const correctArray = task.correct.split(",").map(c => c.trim());
  const [selected, setSelected] = useState<string[]>(wordsArray.map(() => ""));
  const [answered, setAnswered] = useState(false);

  const handleClick = (wordIndex: number, charIndex: number) => {
    if (answered) return;

    const chars = wordsArray[wordIndex].split("");
    const char = chars[charIndex];

    // Заменяем в выбранном массиве
    const newSelected = [...selected];
    newSelected[wordIndex] = char.toUpperCase(); // показываем ударную букву заглавной
    setSelected(newSelected);
  };

  const handleSubmit = () => {
    setAnswered(true);
    onAnswered();
  };

  return (
    <div style={{ marginTop: 30 }}>
      <h2>Поставьте знак ударения в следующих словах</h2>
      {wordsArray.map((word, i) => (
        <div key={i} style={{ margin: "10px 0", fontSize: 24 }}>
          {word.split("").map((ch, ci) => {
            const isVowel = "аеёиоуыэюяАЕЁИОУЫЭЮЯ".includes(ch.toLowerCase());
            const display = selected[i] && ci === word.indexOf(selected[i].toLowerCase()) ? selected[i] : ch;
            return (
              <span
                key={ci}
                onClick={() => isVowel && handleClick(i, ci)}
                style={{
                  cursor: isVowel ? "pointer" : "default",
                  marginRight: 2,
                  fontWeight: display === display.toUpperCase() ? "bold" : "normal",
                  color: display === display.toUpperCase() ? "red" : "black",
                }}
              >
                {display}
              </span>
            );
          })}
        </div>
      ))}
      {!answered && (
        <button onClick={handleSubmit} style={{ marginTop: 20, padding: "10px 30px", fontSize: 20, borderRadius: 20 }}>
          Проверить
        </button>
      )}
    </div>
  );
}
