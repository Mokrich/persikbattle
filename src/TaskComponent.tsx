import { useState } from "react";

export type Task = {
  id: number;
  words: string[]; // ["Алфавит", "Документ", ...]
  correct: string[]; // ["АлфАвит", "ДокУмент", ...]
};

type Props = {
  task: Task;
  onAnswered: () => void;
};

export default function TaskComponent({ task, onAnswered }: Props) {
  const [selected, setSelected] = useState<string[]>(Array(task.words.length).fill(""));

  const handleLetterClick = (wordIndex: number, letterIndex: number) => {
    const word = task.words[wordIndex];
    const newSelected = [...selected];
    const newWord = word
      .split("")
      .map((l, i) => (i === letterIndex ? l.toUpperCase() : l.toLowerCase()))
      .join("");
    newSelected[wordIndex] = newWord;
    setSelected(newSelected);
  };

  const handleCheck = () => {
    alert(
      task.correct
        .map((w, i) => `${w}`)
        .join(" ")
    );
    onAnswered();
  };

  return (
    <div style={{ padding: 20, textAlign: "center" }}>
      <h2>Поставьте знак ударения</h2>
      {task.words.map((word, wIndex) => (
        <div key={wIndex} style={{ marginBottom: 10 }}>
          {word.split("").map((letter, lIndex) => (
            <button
              key={lIndex}
              onClick={() => handleLetterClick(wIndex, lIndex)}
              style={{
                margin: 2,
                padding: "5px 10px",
                borderRadius: 5,
                fontWeight:
                  selected[wIndex][lIndex] === letter.toUpperCase() ? "bold" : "normal",
                textTransform: "uppercase",
              }}
            >
              {letter}
            </button>
          ))}
        </div>
      ))}

      <button
        onClick={handleCheck}
        style={{
          marginTop: 20,
          padding: "10px 20px",
          borderRadius: 25,
          fontSize: 18,
          display: selected.some(s => s !== "") ? "block" : "none",
        }}
      >
        Проверить
      </button>
    </div>
  );
}
