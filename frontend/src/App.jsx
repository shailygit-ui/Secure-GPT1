import { useState } from "react";
import axios from "axios";

function App() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const scanPrompt = async () => {
  try {
    setLoading(true);

    const response = await axios.post("http://localhost:5000/scan", {
      prompt: prompt,
    });

    setResult(response.data);
  } catch (error) {
    console.log(error);
  } finally {
    setLoading(false);
  }
};

  const getThreatLevel = () => {
    if (!result) return "";

    if (result.risk >= 70) return "🔴 HIGH";
    if (result.risk >= 30) return "🟠 MEDIUM";

    return "🟢 LOW";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
        padding: "40px",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            fontSize: "50px",
            marginBottom: "10px",
          }}
        >
          🔒 SecureGPT
        </h1>

        <h3
          style={{
            textAlign: "center",
            color: "#94a3b8",
          }}
        >
          Powered by ArmorIQ Policy Engine
        </h3>

        <p
          style={{
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          AI Prompt Security Scanner
        </p>

        <textarea
          rows="8"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt..."
          style={{
            width: "100%",
            padding: "15px",
            fontSize: "16px",
            borderRadius: "12px",
            border: "1px solid #334155",
            background: "#1e293b",
            color: "white",
          }}
        />

        <br />
        <br />

        <div
          style={{
            textAlign: "center",
          }}
        >
          <button
            onClick={scanPrompt}
            style={{
              background: "#2563eb",
              color: "white",
              border: "none",
              padding: "15px 25px",
              borderRadius: "10px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Scan Prompt
          </button>
        </div>

         {loading && (
           <div style={{ textAlign: "center", marginTop: "20px" }}>
             ⏳ Scanning prompt...
            </div>
          )}

        {result && (
          <div
            style={{
              marginTop: "40px",
            }}
          >
            {result.blocked && (
              <div
                style={{
                  background: "#7f1d1d",
                  padding: "15px",
                  borderRadius: "10px",
                  marginBottom: "20px",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                ⚠ HIGH RISK PROMPT DETECTED
              </div>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
              }}
            >
              {/* Risk Dashboard */}

              <div
                style={{
                  background: "#1e293b",
                  padding: "20px",
                  borderRadius: "12px",
                }}
              >
                <h2>🛡 Risk Dashboard</h2>

                <h3>Risk Score: {result.risk}/100</h3>

                <h3>
                  Trust Score: {result.trustScore || 0}/100
                </h3>

                <div
                  style={{
                    width: "100%",
                    height: "20px",
                    background: "#334155",
                    borderRadius: "10px",
                    overflow: "hidden",
                    marginTop: "10px",
                  }}
                >
                  <div
                    style={{
                      width: `${result.trustScore || 0}%`,
                      height: "100%",
                      background:
                        (result.trustScore || 0) > 70
                          ? "#22c55e"
                          : (result.trustScore || 0) > 40
                          ? "#f59e0b"
                          : "#ef4444",
                    }}
                  />
                </div>

                <h3
                  style={{
                    marginTop: "20px",
                  }}
                >
                  Threat Level: {getThreatLevel()}
                </h3>

                <h3>
                  Status:
                  {result.blocked
                    ? " ❌ BLOCKED"
                    : " ✅ ALLOWED"}
                </h3>
              </div>

              {/* ArmorIQ */}

              <div
                style={{
                  background: "#1e293b",
                  padding: "20px",
                  borderRadius: "12px",
                }}
              >
                <h2>⚡ ArmorIQ Policy Engine</h2>

                <p>
                  Policy:
                  Sensitive Data Protection
                </p>

                <p>
                  Decision:
                  {result.blocked
                    ? " BLOCK"
                    : " ALLOW"}
                </p>

                <p>
                  Audit Log:
                  Created ✓
                </p>

                <hr />

                <p>
                  🔒 Sensitive Items Found:
                  {result.findings.length}
                </p>

                <p>
                  🛡 Protection Status:
                  {result.blocked
                    ? " Threat Prevented"
                    : " Safe"}
                </p>
              </div>
            </div>

            {/* Findings */}

            <div
              style={{
                marginTop: "20px",
                background: "#1e293b",
                padding: "20px",
                borderRadius: "12px",
              }}
            >
              <h2>🔍 Findings</h2>

              {result.findings.length === 0 ? (
                <div
                  style={{
                    background: "#14532d",
                    padding: "12px",
                    borderRadius: "8px",
                  }}
                >
                  ✅ No sensitive information detected
                </div>
              ) : (
                result.findings.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      background: "#7f1d1d",
                      padding: "12px",
                      borderRadius: "8px",
                      marginBottom: "10px",
                    }}
                  >
                    ⚠ {item} Detected
                  </div>
                ))
              )}
            </div>

            {/* Sanitized Prompt */}

            <div
              style={{
                marginTop: "20px",
                background: "#1e293b",
                padding: "20px",
                borderRadius: "12px",
              }}
            >
              <h2>🧹 Auto Sanitized Prompt</h2>

              <textarea
                readOnly
                value={
                  result.sanitizedText ||
                  "No sanitization available"
                }
                style={{
                  width: "100%",
                  height: "140px",
                  background: "#0f172a",
                  color: "white",
                  padding: "12px",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                }}
              />

              <button
                onClick={() =>
                  navigator.clipboard.writeText(
                    result.sanitizedText || ""
                  )
                }
                style={{
                  marginTop: "12px",
                  background: "#22c55e",
                  color: "white",
                  border: "none",
                  padding: "10px 15px",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                📋 Copy Sanitized Prompt
              </button>

              <p
                style={{
                  color: "#22c55e",
                  marginTop: "10px",
                  fontWeight: "bold",
                }}
              >
                ✅ Prompt Sanitized & Safe To Share
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;