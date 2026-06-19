function StatCard({ title, value, color }) {
  return (
    <div
      style={{
        background: "#1e293b",
        borderRadius: "16px",
        padding: "20px",
        textAlign: "center",
        borderTop: `5px solid ${color}`,
        boxShadow: "0 8px 20px rgba(0,0,0,0.25)"
      }}
    >
      <h3
        style={{
          color: "#94a3b8",
          marginBottom: "10px"
        }}
      >
        {title}
      </h3>

      <h1
        style={{
          color: color,
          fontSize: "40px"
        }}
      >
        {value}
      </h1>
    </div>
  );
}

export default StatCard;