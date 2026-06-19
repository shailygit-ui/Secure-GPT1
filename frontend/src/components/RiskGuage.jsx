function RiskGauge({ score }) {
  const radius = 70;
  const stroke = 10;

  const normalizedRadius = radius - stroke * 0.5;

  const circumference = normalizedRadius * 2 * Math.PI;

  const offset =
    circumference -
    (score / 100) * circumference;

  const color =
    score >= 70
      ? "#22c55e"
      : score >= 40
      ? "#f59e0b"
      : "#ef4444";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
      }}
    >
      <svg height={160} width={160}>

        <circle
          stroke="#334155"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx="80"
          cy="80"
        />

        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          r={normalizedRadius}
          cx="80"
          cy="80"
          style={{
            transition: "stroke-dashoffset .7s ease",
          }}
          transform="rotate(-90 80 80)"
        />

        <text
          x="80"
          y="78"
          textAnchor="middle"
          fill="white"
          fontSize="28"
          fontWeight="bold"
        >
          {score}
        </text>

        <text
          x="80"
          y="100"
          textAnchor="middle"
          fill="#94a3b8"
          fontSize="11"
        >
          TRUST
        </text>

      </svg>
    </div>
  );
}

export default RiskGauge;