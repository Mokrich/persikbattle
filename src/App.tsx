import { useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";

export default function App() {
  const [tgUser, setTgUser] = useState<any>(null);
  const [nickname, setNickname] = useState("");
  const [savedNick, setSavedNick] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    WebApp.ready();
    WebApp.expand();

    const user = WebApp.initDataUnsafe?.user;
    setTgUser(user);

    const storedNick = localStorage.getItem("nickname");
    if (storedNick) {
      setSavedNick(storedNick);
    }
  }, []);

  const handleSaveNick = () => {
    if (!nickname.trim()) return;

    localStorage.setItem("nickname", nickname);
    setSavedNick(nickname);
  };

  return (
    <div style={{ padding: 16 }}>

      {/* Верхняя панель */}
      {savedNick && (
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          {tgUser?.photo_url && (
            <img
              src={tgUser.photo_url}
              alt="avatar"
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
              }}
            />
          )}
          <span>{savedNick}</span>
        </div>
      )}

      {/* Ввод ника */}
      {!savedNick && (
        <div>
          <h2>Введите ваш ник</h2>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Ваш ник"
            style={{ padding: 10 }}
          />
          <br /><br />
          <button onClick={handleSaveNick}>
            Сохранить
          </button>
        </div>
      )}

      {/* Тестовое задание */}
      {savedNick && (
        <div style={{ marginTop: 60 }}>
          <h2>📘 Задание</h2>
          <p>
            Поставьте знак ударения в следующих словах:
          </p>

          <p style={{ fontSize: 18, fontWeight: "bold" }}>
            документ, цемент, руководить, каучук
          </p>

          {!showAnswer && (
            <button onClick={() => setShowAnswer(true)}>
              Показать ответ
            </button>
          )}

          {showAnswer && (
            <div style={{ marginTop: 20 }}>
              <h3>✅ Ответ:</h3>
              <p>
                докумЕнт, цемЕнт, руководИть, каучУк
              </p>

              <h4>📖 Пояснение:</h4>
              <p>
                Ударение в этих словах падает на выделенные гласные. 
                В словах «документ» и «цемент» — на второй слог,
                «руководить» — на последний слог,
                «каучук» — на последний слог.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
