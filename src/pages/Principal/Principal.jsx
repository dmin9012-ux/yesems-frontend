import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import Menu from "../../components/Menu/Menu";
import TopBar from "../../components/TopBar/TopBar";

import { obtenerCursos } from "../../servicios/cursosService";
import { obtenerProgresoUsuario } from "../../servicios/progresoService";

import { notify } from "../../Util/toast";

import "./PrincipalStyle.css";

const Principal = () => {

  const { isPremium, user } = useAuth();

  const navigate = useNavigate();

  const [cursos, setCursos] = useState([]);

  const [cursosCompletados, setCursosCompletados] = useState([]);

  const [cargando, setCargando] = useState(true);

  const [esMovil, setEsMovil] = useState(window.innerWidth <= 768);


  /* ===============================
     DETECTAR MOBILE
  =============================== */

  useEffect(() => {

    const handleResize = () => {

      setEsMovil(window.innerWidth <= 768);

    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);

  }, []);


  /* ===============================
     CARGAR DATOS
  =============================== */

  useEffect(() => {

    const cargarDatos = async () => {

      if (!isPremium) {

        try {

          const cursosFirebase = await obtenerCursos();

          setCursos(cursosFirebase);

        } catch (err) {

          console.error("Error al cargar vista previa:", err);

        }

        setCargando(false);

        return;

      }


      setCargando(true);

      try {

        const cursosFirebase = await obtenerCursos();

        const progresoRes = await obtenerProgresoUsuario();

        if (progresoRes.ok) {

          const cursosFinalizados =
            progresoRes.data?.cursosCompletados || [];

          setCursosCompletados(cursosFinalizados);

        }

        setCursos(cursosFirebase);

      } catch (err) {

        console.error("❌ Error en Principal:", err);

        notify("error", "Error al sincronizar tus datos");

      } finally {

        setCargando(false);

      }

    };

    cargarDatos();

  }, [isPremium]);


  /* ===============================
     RENDER
  =============================== */

  return (

    <div className={`principal-container ${esMovil ? "mobile" : ""}`}>

      <TopBar />

      <main className="principal-content">

        <div className="principal-header">

          <h1 className="principal-title">

            Bienvenido, {user?.nombre || "Estudiante"}

          </h1>

          <p className="principal-subtitle">

            {isPremium
              ? "Continúa donde te quedaste en tus cursos."
              : "Estás a un paso de comenzar tu capacitación."}

          </p>

        </div>


        {/* ================= BANNER ================= */}

        {!isPremium && !cargando && (

          <div className="subscription-banner">

            <div className="banner-text">

              <h2>

                ¡Desbloquea todo el contenido! 🔓

              </h2>

              <p>

                Suscríbete para acceder a las lecciones, realizar exámenes y obtener tu constancia oficial.

              </p>

            </div>


            <button
              className="banner-button"
              onClick={() => navigate("/suscripcion")}
            >

              Suscribirme ahora

            </button>

          </div>

        )}


        {/* ================= LOADER ================= */}

        {cargando ? (

          <div className="loader-container">

            <div className="spinner"></div>

            <p>

              Sincronizando tus cursos...

            </p>

          </div>

        ) : (

          <div className={`principal-menu-wrapper ${!isPremium ? "preview-mode" : ""}`}>

            {cursos.length > 0 ? (

              <Menu
                cursos={cursos}
                cursosCompletados={cursosCompletados}
              />

            ) : (

              <div className="empty-state">

                <p>

                  No hay cursos disponibles en este momento.

                </p>

              </div>

            )}

          </div>

        )}

      </main>

    </div>

  );

};

export default Principal;
