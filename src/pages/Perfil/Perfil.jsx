import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Trash2, Edit, LogOut, BookOpen, FileText } from "lucide-react";

import TopBar from "../../components/TopBar/TopBar";
import apiYesems from "../../api/apiYesems";
import ModalPassword from "./ModalPassword";
import ModalEditarPerfil from "./ModalEditarPerfil";

import { useAuth } from "../../context/AuthContext";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { ProgresoContext } from "../../context/ProgresoContext";

import "./PerfilStyle.css";

const Perfil = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  // Extraemos recargarProgreso para asegurar datos frescos
  const { progresoCursos, recargarProgreso } = useContext(ProgresoContext);

  const [usuario, setUsuario] = useState(null);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEditarPerfil, setShowEditarPerfil] = useState(false);

  /* ===============================
      🔄 CARGAR PERFIL Y CURSOS
  =============================== */
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      setLoading(true);
      try {
        // 1. Traer datos del usuario
        const perfilRes = await apiYesems.get("/usuario/perfil/me");
        setUsuario(perfilRes.data.usuario);

        // 2. Traer info de cursos desde Firebase
        const snap = await getDocs(collection(db, "cursos"));
        const cursosFirebase = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setCursos(cursosFirebase);

        // 3. Forzar recarga de progreso desde el Backend
        // Esto traerá los cambios que hicimos con 'markModified'
        await recargarProgreso();

      } catch (error) {
        console.error("Error cargando perfil:", error);
        // Solo redirigir si el error es de autenticación (401/403)
        if (error.response?.status === 401) {
          logout();
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    cargarDatosIniciales();
  }, []); // Se ejecuta una vez al montar

  /* ===============================
      📊 CALCULAR PROGRESO
  =============================== */
  const calcularProgreso = (curso) => {
    // Buscamos el progreso que viene del backend (ya actualizado tras el examen)
    const progresoDB = progresoCursos.find((c) => c.cursoId === curso.id);
    
    // Si no hay progreso en DB, el avance es 0
    const leccionesCompletadas = progresoDB ? progresoDB.leccionesCompletadas : [];
    
    // Sumar total de lecciones configuradas en el curso de Firebase
    const totalLecciones =
      curso.niveles?.reduce((acc, n) => acc + (n.lecciones?.length || 0), 0) || 0;

    const porcentaje = totalLecciones > 0 
      ? Math.round((leccionesCompletadas.length / totalLecciones) * 100) 
      : 0;

    // Un curso está realmente completado si el backend dice 'completado: true'
    const cursoCompletadoDB = progresoDB?.completado || false;

    return {
      porcentaje,
      completadas: leccionesCompletadas.length,
      total: totalLecciones,
      estado:
        porcentaje === 0
          ? "no-iniciado"
          : cursoCompletadoDB
          ? "completado"
          : "en-progreso",
      completado: cursoCompletadoDB,
      constanciaEmitida: progresoDB?.constanciaEmitida || false,
    };
  };

  /* ===============================
      📄 DESCARGAR CONSTANCIA
  =============================== */
  const descargarConstancia = async (cursoId, nombreCurso) => {
    try {
      const res = await apiYesems.get(`/constancia/${cursoId}`, { responseType: "blob" });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Constancia-${nombreCurso}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error descargando constancia:", error);
      alert("La constancia aún se está procesando o no está disponible.");
    }
  };

  /* ===============================
      🗑 ELIMINAR CUENTA
  =============================== */
  const eliminarCuenta = async () => {
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer."
    );
    if (!confirmar) return;

    try {
      await apiYesems.delete("/usuario/perfil/me");
      alert("✅ Cuenta eliminada correctamente");
      logout();
      navigate("/login");
    } catch (error) {
      console.error("Error eliminando cuenta:", error);
      alert("❌ No se pudo eliminar la cuenta");
    }
  };

  if (loading) return <div className="perfil-cargando">Cargando tu progreso...</div>;
  if (!usuario) return null;

  return (
    <>
      <TopBar />
      <div className="perfil-page">
        <aside className="perfil-sidebar">
          <div className="perfil-avatar">{usuario.nombre?.charAt(0).toUpperCase()}</div>
          <h3>{usuario.nombre}</h3>
          <p className="perfil-email"><Mail size={14} /> {usuario.email}</p>
          <button onClick={() => setShowEditarPerfil(true)}><Edit size={16} /> Editar Perfil</button>
          <button onClick={() => setShowPasswordModal(true)}><Lock size={16} /> Cambiar Contraseña</button>
          <button className="danger" onClick={eliminarCuenta}><Trash2 size={16} /> Eliminar Cuenta</button>
          <button className="logout" onClick={() => { logout(); navigate("/login"); }}><LogOut size={16} /> Cerrar sesión</button>
        </aside>

        <main className="perfil-main">
          <h2><BookOpen size={20} /> Mis Cursos</h2>
          {cursos.length === 0 && <p>No hay cursos disponibles actualmente.</p>}
          {cursos.map((curso) => {
            const p = calcularProgreso(curso);
            return (
              <div key={curso.id} className={`curso-card ${p.estado}`}>
                <div className="curso-header">
                  <strong>{curso.nombre}</strong>
                  <span>
                    {p.completado ? "✅ Completado" : p.porcentaje > 0 ? "🕒 En progreso" : "⚪ No iniciado"}
                  </span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${p.porcentaje}%` }} />
                </div>
                <small>{p.completadas}/{p.total} lecciones ({p.porcentaje}%)</small>
                {p.completado && p.constanciaEmitida ? (
                  <button className="btn-constancia" onClick={() => descargarConstancia(curso.id, curso.nombre)}>
                    <FileText size={16} /> Descargar constancia
                  </button>
                ) : (
                  <button className="btn-continuar" onClick={() => navigate(`/curso/${curso.id}`)}>
                    ▶ {p.porcentaje > 0 ? "Continuar" : "Empezar"} curso
                  </button>
                )}
              </div>
            );
          })}
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