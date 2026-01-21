import React from "react";
import { Routes, Route } from "react-router-dom";

// Páginas públicas
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import VerificarCorreo from "./pages/VerificarCorreo/VerificarCorreo";

// 🔐 Recuperar contraseña
import ForgotPassword from "./pages/Auth/ForgotPassword";
import VerifyCode from "./pages/Auth/VerifyCode";
import ResetPassword from "./pages/Auth/ResetPassword";

// Páginas usuario
import Principal from "./pages/Principal/Principal";
import Curso from "./pages/Curso/Curso";
import Leccion from "./pages/Curso/Leccion";
import Perfil from "./pages/Perfil/Perfil";

// 📝 Examen
import Examen from "./pages/Examen/Examen";

// Admin
import AdminPanel from "./pages/Admin/AdminPanel";
import {
  ListarCursos,
  CrearCurso,
  EditarCurso,
  EliminarCurso,
} from "./pages/Admin/Cursos";

import ListarUsuarios from "./pages/Admin/Usuarios/ListarUsuarios";
import EditarUsuario from "./pages/Admin/Usuarios/EditarUsuario";
import DashboardReportes from "./pages/Admin/Reportes/DashboardReportes";

// Rutas protegidas
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";

// Contexto
import { ProgresoProvider } from "./context/ProgresoContext";

// Toasts
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  return (
    <ProgresoProvider>
      <>
        <Routes>
          {/* ================= RUTAS PÚBLICAS ================= */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* 🔐 RECUPERAR CONTRASEÑA */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-code" element={<VerifyCode />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* ✔ VERIFICAR CORREO */}
          <Route
            path="/verificar-correo/:token"
            element={<VerificarCorreo />}
          />

          {/* ================= RUTAS USUARIO ================= */}
          <Route element={<PrivateRoute />}>
            <Route path="/principal" element={<Principal />} />
            <Route path="/perfil" element={<Perfil />} />

            <Route path="/curso/:id" element={<Curso />} />

            <Route
              path="/curso/:id/nivel/:nivel/leccion/:num"
              element={<Leccion />}
            />

            {/* 📝 EXAMEN */}
            <Route
              path="/curso/:id/nivel/:nivel/examen"
              element={<Examen />}
            />
          </Route>

          {/* ================= RUTAS ADMIN ================= */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminPanel />} />

            {/* Cursos */}
            <Route path="/admin/cursos" element={<ListarCursos />} />
            <Route path="/admin/cursos/crear" element={<CrearCurso />} />
            <Route
              path="/admin/cursos/editar/:id"
              element={<EditarCurso />}
            />
            <Route
              path="/admin/cursos/eliminar/:id"
              element={<EliminarCurso />}
            />

            {/* Usuarios */}
            <Route path="/admin/usuarios" element={<ListarUsuarios />} />
            <Route
              path="/admin/usuarios/editar/:id"
              element={<EditarUsuario />}
            />

            {/* Reportes */}
            <Route
              path="/admin/reportes"
              element={<DashboardReportes />}
            />
          </Route>
        </Routes>

        {/* 🔔 Toasts globales */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          newestOnTop
          closeOnClick
          pauseOnHover
        />
      </>
    </ProgresoProvider>
  );
};

export default App;
