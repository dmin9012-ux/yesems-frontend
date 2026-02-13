import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import TopBarAdmin from "../../../components/TopBarAdmin/TopBarAdmin";
import { obtenerUsuarios } from "../../../servicios/usuarioAdminService";
import { notify, confirmDialog } from "../../../Util/toast";
import apiYesems from "../../../api/apiYesems";

import {
  Search,
  Edit3,
  Zap,
  ArrowLeft,
  ShieldCheck,
  User
} from "lucide-react";

import "./UsuariosStyle.css";

export default function ListarUsuarios() {

  const navigate = useNavigate();

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("");



  /* ========================================================
     CARGAR USUARIOS
  ======================================================== */

  const cargarUsuarios = async () => {

    try {

      setLoading(true);

      const res = await obtenerUsuarios();

      setUsuarios(res || []);

    } catch (err) {

      console.error(err);

      notify(
        "error",
        "Error al sincronizar la lista de usuarios."
      );

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    cargarUsuarios();

  }, []);



  /* ========================================================
     ACTIVAR PREMIUM
  ======================================================== */

  const handleActivarPremium = async (usuario) => {

    const result = await confirmDialog(
      `¿Activar Premium para ${usuario.nombre}?`,
      "Se otorgará 1 hora de acceso inmediato.",
      "question",
      false
    );


    if (!result.isConfirmed) return;


    try {

      await apiYesems.post(
        "/usuario/activar-premium-admin",
        {
          usuarioId: usuario._id,
          horas: 1,
          tipo: "prueba_hora"
        }
      );


      notify(
        "success",
        `Premium activado para ${usuario.nombre}`
      );


      cargarUsuarios();


    } catch (err) {

      notify(
        "error",
        err?.response?.data?.message ||
        "Error al activar premium"
      );

    }

  };



  /* ========================================================
     FILTRO MEMORIZADO
  ======================================================== */

  const usuariosFiltrados = useMemo(() => {

    if (!filtro.trim()) return usuarios;

    const texto = filtro.toLowerCase();

    return usuarios.filter(u =>
      u.nombre.toLowerCase().includes(texto) ||
      u.email.toLowerCase().includes(texto)
    );

  }, [usuarios, filtro]);



  /* ========================================================
     LOADING
  ======================================================== */

  if (loading)
    return (

      <div className="admin-page-layout">

        <TopBarAdmin />

        <div className="admin-loading-container with-topbar">

          <div className="spinner"></div>

          <p>Cargando usuarios...</p>

        </div>

      </div>

    );



  /* ========================================================
     RENDER
  ======================================================== */

  return (

    <div className="admin-page-layout">

      <TopBarAdmin />

      <div className="admin-content-wrapper">



        {/* HEADER */}

        <header className="admin-page-header responsive">

          <div>

            <h1>Gestión de Usuarios</h1>

            <p className="admin-subtitle">
              Administra roles y accesos de la plataforma
            </p>

          </div>


          <button
            className="btn-volver"
            onClick={() => navigate("/admin")}
          >
            <ArrowLeft size={16} />
            Volver al Panel
          </button>


        </header>



        {/* SEARCH */}

        <div className="table-controls">

          <div className="search-box">

            <Search size={18} />

            <input
              type="text"
              placeholder="Buscar usuario..."
              value={filtro}
              onChange={(e) =>
                setFiltro(e.target.value)
              }
            />

          </div>

        </div>



        {/* SIN DATOS */}

        {usuariosFiltrados.length === 0 && (

          <div className="usuario-edit-card">

            <p>No se encontraron usuarios.</p>

          </div>

        )}



        {/* ========================================================
           TABLA DESKTOP
        ======================================================== */}

        {usuariosFiltrados.length > 0 && (

          <div className="table-wrapper desktop-only">

            <table className="usuarios-table">

              <thead>

                <tr>

                  <th>Usuario</th>

                  <th>Email</th>

                  <th>Rol</th>

                  <th>Estado</th>

                  <th>Acciones</th>

                </tr>

              </thead>

              <tbody>

                {usuariosFiltrados.map(u => (

                  <tr key={u._id}>

                    <td>

                      <strong>{u.nombre}</strong>

                    </td>


                    <td>

                      {u.email}

                    </td>


                    <td>

                      <span
                        className={`badge-rol ${u.rol}`}
                      >

                        {u.rol === "admin"
                          ? "Admin"
                          : "Usuario"}

                      </span>

                    </td>


                    <td>

                      <span
                        className={`status-dot ${u.estado}`}
                      ></span>

                      {u.estado}

                    </td>


                    <td>

                      <div className="action-buttons-cell">


                        <button
                          className="btn-accion-premium"
                          onClick={() =>
                            handleActivarPremium(u)
                          }
                        >
                          <Zap size={16} />
                        </button>


                        <button
                          className="btn-accion-edit"
                          onClick={() =>
                            navigate(
                              `/admin/usuarios/editar/${u._id}`
                            )
                          }
                        >
                          <Edit3 size={16} />
                        </button>


                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}



        {/* ========================================================
           TARJETAS MOBILE
        ======================================================== */}

        <div className="mobile-only">

          {usuariosFiltrados.map(u => (

            <div
              key={u._id}
              className="usuario-edit-card"
            >

              <div className="premium-header">

                {u.rol === "admin"
                  ? <ShieldCheck size={18} />
                  : <User size={18} />}

                <strong>{u.nombre}</strong>

              </div>


              <p>{u.email}</p>


              <p>

                <span
                  className={`badge-rol ${u.rol}`}
                >
                  {u.rol}
                </span>

              </p>


              <p>

                <span
                  className={`status-dot ${u.estado}`}
                ></span>

                {u.estado}

              </p>


              <div className="form-actions-admin">

                <button
                  className="btn-accion-premium"
                  onClick={() =>
                    handleActivarPremium(u)
                  }
                >
                  Premium
                </button>


                <button
                  className="btn-accion-edit"
                  onClick={() =>
                    navigate(
                      `/admin/usuarios/editar/${u._id}`
                    )
                  }
                >
                  Editar
                </button>


              </div>


            </div>

          ))}

        </div>



      </div>

    </div>

  );

}
