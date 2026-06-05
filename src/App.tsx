import React, { useEffect } from "react";
import { BrowserRouter, useLocation } from "react-router";
import { ScreenNavigation } from "./components/ScreenNavigation";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    const scrollableMain = document.querySelector("main");
    scrollableMain?.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ScreenNavigation />
    </BrowserRouter>
  );
}
