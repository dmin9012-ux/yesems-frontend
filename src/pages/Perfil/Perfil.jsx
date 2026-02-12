import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, Trash2, Edit, LogOut, BookOpen, FileText, Star, Clock } from "lucide-react"; // 👈 Añadido Clock

import TopBar from "../../components/TopBar/TopBar";
import apiYesems from "../../api/apiYesems";
import ModalPassword from "./ModalPassword";
import ModalEditarPerfil from "./ModalEditarPerfil";

import { useAuth } from "../../context/AuthContext";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { ProgresoContext } from "../../context/ProgresoContext";
import { notify, confirmDialog } from "../../Util/toast";

import "./PerfilStyle.css";

const Perfil = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, actualizarDatosUsuario, isPremium, user } = useAuth(); // 👈 Traemos 'user' del contexto
  const { progresoCursos, recargarProgreso } = useContext(ProgresoContext);

  const [usuario, setUsuario] = useState(null);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEditarPerfil, setShowEditarPerfil] = useState(false);

  // 🕒 ESTADO PARA EL CONTADOR
  const [tiempoRestante, setTiempoRestante] = useState("");

  /* ========================================================
      🎉 DETECCIÓN DE RETORNO DE MERCADO PAGO
  ======================================================== */
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const status = queryParams.get("status");

    if (status === "approved") {
      notify("success", "¡Pago procesado con éxito! Bienvenido al nivel Premium.");
      actualizarDatosUsuario();
      navigate("/perfil", { replace: true });
    } else if (status === "failure") {
      notify("error", "Hubo un problema con tu pago. Por favor, reintenta.");
      navigate("/perfil", { replace: true });
    }
  }, [location, actualizarDatosUsuario, navigate]);

  /* ========================================================
      ⏱️ LÓGICA DEL CONTADOR PREMIUM
  ======================================================== */
  useEffect(() => {
    if (!isPremium || !user?.suscripcion?.fechaFin) return;

    const calcularDiferencia = () => {
      const ahora = new Date();
      const fin = new Date(user.suscripcion.fechaFin);
      const diferencia = fin - ahora;

      if (diferencia <= 0) {
        setTiempoRestante("Expirado");
        return;
      }

      const minutos = Math.floor((diferencia / 1000 / 60) % 60);
      const segundos = Math.floor((diferencia / 1000) % 60);

      setTiempoRestante(`${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`);
    };

    calcularDiferencia(); // Ejecutar al inicio
    const interval = setInterval(calcularDiferencia, 1000);

    return () => clearInterval(interval);
  }, [isPremium, user]);

  useEffect(() => {
    const cargarDatosIniciales = async () => {
      setLoading(true);
      try {
        const perfilRes = await apiYesems.get("/usuario/perfil/me");
        setUsuario(perfilRes.data.usuario);

        const snap = await getDocs(collection(db, "cursos"));
        const cursosFirebase = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setCursos(cursosFirebase);

        await recargarProgreso();
      } catch (error) {
        console.error("Error cargando perfil:", error);
        if (error.response?.status === 401) {
          logout();
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };
    cargarDatosIniciales();
  }, [logout, navigate, recargarProgreso]);

  // ... (mantenemos la función calcularProgreso y eliminarCuenta igual)

  const calcularProgreso = (curso) => {
    const progresoDB = progresoCursos.find((c) => c.cursoId === curso.id);
    const leccionesCompletadas = progresoDB ? progresoDB.leccionesCompletadas : [];
    const totalLecciones = curso.niveles?.reduce((acc, n) => acc + (n.lecciones?.length || 0), 0) || 0;
    const porcentaje = totalLecciones > 0 ? Math.round((leccionesCompletadas.length / totalLecciones) * 100) : 0;
    const cursoCompletadoDB = progresoDB?.completado || false;

    return {
      porcentaje,
      completadas: leccionesCompletadas.length,
      total: totalLecciones,
      estado: porcentaje === 0 ? "no-iniciado" : cursoCompletadoDB ? "completado" : "en-progreso",
      completado: cursoCompletadoDB,
      constanciaEmitida: progresoDB?.constanciaEmitida || false,
    };
  };

  const eliminarCuenta = async () => {
    const result = await confirmDialog("¿Eliminar?", "Esta acción es permanente.", "warning");
    if (result.isConfirmed) {
      try {
        await apiYesems.delete("/usuario/perfil/me");
        logout();
        navigate("/login");
      } catch (error) {
        notify("error", "Error al eliminar");
      }
    }
  };

  if (loading) return <div className="perfil-cargando"><div className="spinner"></div><p>Cargando tu progreso...</p></div>;
  if (!usuario) return null;

  return (
    <>
      <TopBar />
      <div className="perfil-page">
        <aside className="perfil-sidebar">
          <div className="perfil-avatar-container">
            <div className="perfil-avatar">{usuario.nombre?.charAt(0).toUpperCase()}</div>
            {isPremium && <div className="premium-badge-icon" title="Usuario Premium"><Star size={16} fill="gold" /></div>}
          </div>
          <h3>{usuario.nombre}</h3>
          
          <div className="status-container-perfil"> {/* Contenedor para el status y el timer */}
            <span className={`status-pill ${isPremium ? "premium" : "free"}`}>
              {isPremium ? "Plan Premium" : "Plan Gratuito"}
            </span>

            {/* 🕒 BLOQUE DEL TIMER PREMIUM */}
            {isPremium && tiempoRestante && (
              <div className="premium-timer-badge">
                <Clock size={12} />
                <span>Tiempo restante: <strong>{tiempoRestante}</strong></span>
              </div>
            )}
          </div>

          <p className="perfil-email"><Mail size={14} /> {usuario.email}</p>
          
          <nav className="perfil-nav">
            {!isPremium && <button className="upgrade-btn" onClick={() => navigate("/suscripcion")}><Star size={16} /> ¡Hazte Premium!</button>}
            <button onClick={() => setShowEditarPerfil(true)}><Edit size={16} /> Editar Perfil</button>
            <button onClick={() => setShowPasswordModal(true)}><Lock size={16} /> Cambiar Contraseña</button>
            <button className="logout" onClick={() => { logout(); navigate("/login"); }}><LogOut size={16} /> Cerrar sesión</button>
            <button className="danger" onClick={eliminarCuenta}><Trash2 size={16} /> Eliminar Cuenta</button>
          </nav>
        </aside>

        <main className="perfil-main">
          {/* ... resto del contenido igual ... */}
          <div className="perfil-main-header">
            <h2><BookOpen size={24} /> Mi Progreso Académico</h2>
          </div>
          <div className="cursos-list">
            {cursos.map((curso) => {
              const p = calcularProgreso(curso);
              return (
                <div key={curso.id} className={`perfil-curso-card ${p.estado}`}>
                  <div className="curso-info">
                    <strong>{curso.nombre}</strong>
                    <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${p.porcentaje}%` }} /></div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      {showPasswordModal && <ModalPassword onClose={() => setShowPasswordModal(false)} />}
      {showEditarPerfil && (
        <ModalEditarPerfil
          usuario={usuario}
          setUsuario={setUsuario}
          onClose={() => setShowEditarPerfil(false)}
          onChangePassword={() => setShowPasswordModal(true)}
        />
      )}
    </>
  );
};

export default Perfil;