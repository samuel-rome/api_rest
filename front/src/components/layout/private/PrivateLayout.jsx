import React from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { SideBar } from "./SideBar";

export const PrivateLayout = () => {
  return (
    <>
      {/* LAYAOUT */}

      {/* Cabecera y navegacion */}
      <Header />

      {/* CONTENIDO PRINCIPAL */}

      <section className="layout__content">
        <Outlet />
      </section>

      {/* Barra Lateral */}
      <SideBar />
    </>
  );
};
