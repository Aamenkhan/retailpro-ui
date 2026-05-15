import React, { useState, useEffect } from "react";
import ShopAuth from "./ShopAuth";
import PosApp from "./PosApp";
import { clearSession, restoreSession, clearLegacyGlobalData } from "./shopStorage";

export default function App() {
  const [shop, setShop] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    clearLegacyGlobalData();
    setShop(restoreSession());
    setReady(true);
  }, []);

  const handleLogout = () => {
    clearSession();
    setShop(null);
  };

  if (!ready) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#080C18",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#4A5580",
          fontFamily: "'Syne', sans-serif",
        }}
      >
        Loading…
      </div>
    );
  }

  if (!shop) {
    return <ShopAuth onLogin={setShop} />;
  }

  return <PosApp key={shop.id} shop={shop} onLogout={handleLogout} />;
}
