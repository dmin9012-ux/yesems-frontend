import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Trash2, Edit, LogOut, BookOpen, FileText, ChevronRight, Award } from "lucide-react";

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
  const { logout } = useAuth();
  const { progresoCursos, recargarProgreso } = useContext(ProgresoContext);

  const [usuario, setUsuario] = useState(null);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEditarPerfil, setShowEditarPerfil] = useState(false);

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

  const descargarConstancia = async (cursoId, nombreCurso) => {
    try {
      notify("info", "Generando tu certificado...");
      const res = await apiYesems.get(`/constancia/${cursoId}`, { responseType: "blob" });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Certificado-${nombreCurso}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      notify("success", "¡Certificado descargado con éxito!");
    } catch (error) {
      notify("info", "Tu certificado se está procesando. Reintenta en breve.");
    }
  };

  const eliminarCuenta = async () => {
    const result = await confirmDialog(
      "¿Eliminar cuenta?",
      "Esta acción es permanente y perderás todo tu progreso académico.",
      "warning"
    );

    if (result.isConfirmed) {
      try {
        await apiYesems.delete("/usuario/perfil/me");
        notify("success", "Cuenta eliminada correctamente");
        logout();
        navigate("/login");
      } catch (error) {
        notify("error", "No se pudo eliminar la cuenta");
      }
    }
  };

  if (loading) return (
    <div className="perfil-cargando">
      <div className="spinner-loader"></div>
      <p>Sincronizando tus logros...</p>
    </div>
  );

  if (!usuario) return null;

  return (
    <>
      <TopBar />
      <div className="perfil-page">
        <aside className="perfil-sidebar">
          <div className="sidebar-header">
            <div className="perfil-avatar">
              {usuario.nombre?.charAt(0).toUpperCase()}
            </div>
            <h3>{usuario.nombre}</h3>
            <p className="perfil-email"><Mail size={14} /> {usuario.email}</p>
          </div>
          
          <nav className="perfil-nav">
            <button onClick={() => setShowEditarPerfil(true)}>
              <Edit size={18} /> Editar Perfil
            </button>
            <button onClick={() => setShowPasswordModal(true)}>
              <Lock size={18} /> Seguridad
            </button>
            <div className="nav-divider"></div>
            <button className="logout" onClick={() => { logout(); navigate("/login"); }}>
              <LogOut size={18} /> Cerrar sesión
            </button>
            <button className="danger" onClick={eliminarCuenta}>
              <Trash2 size={18} /> Eliminar Cuenta
            </button>
          </nav>
        </aside>

        <main className="perfil-main">
          <header className="perfil-main-header">
            <div className="header-title">
              <BookOpen size={28} />
              <h2>Mi Progreso Académico</h2>
            </div>
            <p>Gestiona tus cursos activos y descarga tus certificaciones oficiales.</p>
          </header>

          <section className="cursos-grid">
            {cursos.length === 0 && <div className="no-data">No hay cursos disponibles en este momento.</div>}
            {cursos.map((curso) => {
              const p = calcularProgreso(curso);
              return (
                <div key={curso.id} className={`perfil-curso-card ${p.estado}`}>
                  <div className="curso-card-header">
                    <div className="curso-title-group">
                      <strong>{curso.nombre}</strong>
                      <span className={`badge ${p.estado}`}>
                        {p.completado ? "Completado" : p.porcentaje > 0 ? "En curso" : "Pendiente"}
                      </span>
                    </div>
                    {p.completado && <Award className="award-icon" size={24} />}
                  </div>

                  <div className="progress-section">
                    <div className="progress-labels">
                      <span>{p.porcentaje}% del curso</span>
                      <span>{p.completadas}/{p.total} Lecciones</span>
                    </div>
                    <div className="progress-bar-bg">
                      <div className="progress-bar-fill" style={{ width: `${p.porcentaje}%` }} />
                    </div>
                  </div>

                  <div className="curso-card-footer">
                    {p.completado && p.constanciaEmitida ? (
                      <button className="btn-perfil-constancia" onClick={() => descargarConstancia(curso.id, curso.nombre)}>
                        <FileText size={18} /> Descargar Certificado
                      </button>
                    ) : (
                      <button className="btn-perfil-continuar" onClick={() => navigate(`/curso/${curso.id}`)}>
                        <span>{p.porcentaje > 0 ? "Continuar Lección" : "Comenzar ahora"}</span>
                        <ChevronRight size={18} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </section>
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