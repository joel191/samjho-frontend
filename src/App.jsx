import { useState, useEffect } from "react";

function App() {
  const [input, setInput] = useState("");
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("en");
  const [mode, setMode] = useState("");
  const [confidenceMessage, setConfidenceMessage] = useState("");
  const [journal, setJournal] = useState([]);

  // Load journal on start
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("samjho_journal")) || [];
    setJournal(saved);
  }, []);

  function saveToJournal(text) {
    const updated = [
      ...journal,
      { text, date: new Date().toLocaleString() },
    ];
    localStorage.setItem("samjho_journal", JSON.stringify(updated));
    setJournal(updated);
  }

  async function explain() {
    if (!input.trim()) return;

    setLoading(true);

    const res = await fetch("https://samjho-backend.onrender.com/api/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: input, language }),
    });

    const data = await res.json();

    setExplanation(data.explanation);
    setMode(data.mode || "study");
    setConfidenceMessage("You took a step forward today. That matters 🌱");
    saveToJournal(input);

    setLoading(false);
  }

  async function askDoubt(type) {
    setLoading(true);

    const res = await fetch("https://samjho-backend.onrender.com/api/doubt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        previousExplanation: explanation,
        doubtType: type,
        language,
      }),
    });

    const data = await res.json();
    setExplanation(data.explanation);
    setConfidenceMessage("Asking doubts means you are learning deeply 💡");

    setLoading(false);
  }

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", fontFamily: "sans-serif" }}>
      <h2>What do you want help with today?</h2>

      {/* Language */}
      <div style={{ marginBottom: "10px" }}>
        <label>
          Language:{" "}
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
          </select>
        </label>
      </div>

      {/* Explanation Level (UI only) */}
      <div style={{ marginBottom: "10px" }}>
        <label>
          Explanation level:{" "}
          <select>
            <option>Very simple</option>
            <option>Simple</option>
            <option>Normal</option>
          </select>
        </label>
      </div>

      {/* Input */}
      <textarea
        rows={5}
        style={{ width: "100%", padding: "10px", fontSize: "16px" }}
        placeholder="Paste your question, text, or doubt here..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <button onClick={explain} style={{ marginTop: "10px", padding: "10px" }}>
        {loading ? "Thinking calmly..." : "Explain calmly"}
      </button>

      {/* Explanation */}
      {explanation && (
        <div style={{ marginTop: "24px", background: "#f9f9f9", padding: "16px" }}>
          {mode && (
            <div
              style={{
                display: "inline-block",
                padding: "4px 8px",
                marginBottom: "8px",
                background: mode === "code" ? "#e3f2fd" : "#e8f5e9",
                borderRadius: "6px",
                fontSize: "12px",
              }}
            >
              {mode === "code" ? "💻 Code Explanation" : "📘 Study Explanation"}
            </div>
          )}

          <p style={{ whiteSpace: "pre-wrap" }}>{explanation}</p>

          <div style={{ marginTop: "16px" }}>
            <p>Still confused? That’s okay:</p>
            <button onClick={() => askDoubt("simpler")}>Explain simpler</button>{" "}
            <button onClick={() => askDoubt("why")}>Why?</button>{" "}
            <button onClick={() => askDoubt("confused")}>I’m still confused</button>
          </div>
        </div>
      )}

      {/* Confidence */}
      {confidenceMessage && (
        <div
          style={{
            marginTop: "16px",
            padding: "10px",
            background: "#fffde7",
            borderRadius: "6px",
            fontSize: "14px",
          }}
        >
          {confidenceMessage}
        </div>
      )}

      {/* Journal */}
      <div style={{ marginTop: "40px" }}>
        <h4>Your learning today</h4>
        {journal.length === 0 ? (
          <p>No learning entries yet.</p>
        ) : (
          <ul>
            {journal.slice(-3).map((item, index) => (
              <li key={index}>
                {item.text} <small>({item.date})</small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;
