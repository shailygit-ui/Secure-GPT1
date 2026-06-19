function Sidebar() {

  const scrollTo = (id) => {
    document
      .getElementById(id)
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  return (
    <div className="sidebar">

      <h2 className="logo">
        🛡 SecureGPT
      </h2>

      <div className="menu">

        <div
          className="menu-item active"
          onClick={() => scrollTo("dashboard")}
        >
          🏠 Dashboard
        </div>

        <div
          className="menu-item"
          onClick={() => scrollTo("scanner")}
        >
          🔍 Prompt Scanner
        </div>

        <div
          className="menu-item"
          onClick={() => scrollTo("analytics")}
        >
          📊 Analytics
        </div>

        <div
          className="menu-item"
          onClick={() => scrollTo("reports")}
        >
          📄 Reports
        </div>

        <div
          className="menu-item"
          onClick={() => scrollTo("history")}
        >
          🕒 Scan History
        </div>

      </div>

    </div>
  );
}

export default Sidebar;