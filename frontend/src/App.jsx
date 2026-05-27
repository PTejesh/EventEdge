import { useState, useEffect } from "react";

function App() {
  const [contracts, setContracts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const [contractsRes, summaryRes] = await Promise.all([
        fetch("http://localhost:8000/api/contracts/"),
        fetch("http://localhost:8000/api/market/summary"),
      ]);
      const contractsData = await contractsRes.json();
      const summaryData = await summaryRes.json();
      setContracts(contractsData);
      setSummary(summaryData);
      setError(null);
    } catch (err) {
      setError("Cannot connect to backend. Make sure uvicorn is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ background: "#0f0f0f", minHeight: "100vh", color: "#e0e0e0", fontFamily: "monospace", padding: "24px" }}>
      <h1 style={{ color: "#00ff88", marginBottom: "8px" }}>EventEdge</h1>
      <p style={{ color: "#888", marginBottom: "24px" }}>Kalshi prediction market tracker</p>
      {summary && (
        <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
          <div style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: "8px", padding: "16px", flex: 1 }}>
            <div style={{ color: "#888", fontSize: "12px" }}>ACTIVE CONTRACTS</div>
            <div style={{ color: "#00ff88", fontSize: "28px", fontWeight: "bold" }}>{summary.active_contracts}</div>
          </div>
          <div style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: "8px", padding: "16px", flex: 1 }}>
            <div style={{ color: "#888", fontSize: "12px" }}>TOTAL VOLUME</div>
            <div style={{ color: "#00ff88", fontSize: "28px", fontWeight: "bold" }}>${summary.total_volume?.toLocaleString()}</div>
          </div>
        </div>
      )}
      {loading && <p style={{ color: "#888" }}>Loading contracts...</p>}
      {error && <p style={{ color: "#ff4444" }}>{error}</p>}
      {!loading && !error && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #333" }}>
              {["Ticker", "Bid", "Ask", "Spread", "Implied Prob", "Volume"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "10px", color: "#888", fontSize: "12px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {contracts.map((c) => (
              <tr key={c.ticker} style={{ borderBottom: "1px solid #1a1a1a" }}>
                <td style={{ padding: "12px 10px", color: "#00ff88", fontWeight: "bold" }}>{c.ticker}</td>
                <td style={{ padding: "12px 10px" }}>${c.bid?.toFixed(2)}</td>
                <td style={{ padding: "12px 10px" }}>${c.ask?.toFixed(2)}</td>
                <td style={{ padding: "12px 10px", color: "#ffaa00" }}>${c.spread?.toFixed(2)}</td>
                <td style={{ padding: "12px 10px", color: "#00aaff" }}>{(c.implied_probability * 100)?.toFixed(1)}%</td>
                <td style={{ padding: "12px 10px" }}>{c.volume?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;
