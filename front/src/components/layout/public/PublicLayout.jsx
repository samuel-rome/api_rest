import React from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";

export const PublicLayout = () => {
  return (
    <>
      {/* LAYAOUT */}
      <Header />

      {/* CONTENIDO PRINCIPAL */}

      <section className="layout__content">
        <Outlet />
      </section>
    </>
  );
};
