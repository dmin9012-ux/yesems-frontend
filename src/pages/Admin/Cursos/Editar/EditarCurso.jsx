import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../../../firebase/firebaseConfig";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import TopBarAdmin from "../../../../components/TopBarAdmin/TopBarAdmin";
import { notify } from "../../../../Util/toast"; // 👈 Sincronizado con tus Toasts
import { Save, Plus, Trash2, FileText, Video, HelpCircle, ArrowLeft } from "lucide-react"; 
import "./EditarCursoStyle.css";

export default function EditarCurso() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [curso, setCurso] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const ref = doc(db, "cursos", id);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          notify("error", "Curso no encontrado");
          navigate("/admin/cursos");
          return;
        }
        setCurso(snap.data());
      } catch (err) {
        notify("error", "Error al cargar datos");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  const updateDeep = (path, value) => {
    const copy = JSON.parse(JSON.stringify(curso));
    const parts = path.split(".");
    let current = copy;
    for (let i = 0; i < parts.length - 1; i++) {
      current = current[isNaN(parts[i]) ? parts[i] : Number(parts[i])];
    }
    current[parts.at(-1)] = value;
    setCurso(copy);
  };

  const addArrayItem = (field) =>
    setCurso((prev) => ({ ...prev, [field]: [...prev[field], ""] }));

  const removeArrayItem = (field, index) => {
    const copy = [...curso[field]];
    copy.splice(index, 1);
    setCurso({ ...curso, [field]: copy });
  };

  const addNivel = () =>
    setCurso((prev) => ({
      ...prev,
      niveles: [
        ...prev.niveles,
        { numero: prev.niveles.length + 1, titulo: "", lecciones: [], preguntas: [] }
      ]
    }));

  const removeNivel = (ni) => {
    const copy = [...curso.niveles];
    copy.splice(ni, 1);
    setCurso({ ...curso, niveles: copy.map((n, i) => ({ ...n, numero: i + 1 })) });
  };

  const addLeccion = (ni) => {
    const copy = JSON.parse(JSON.stringify(curso));
    copy.niveles[ni].lecciones.push({
      id: crypto.randomUUID(), titulo: "", videoURL: "", contenidoHTML: "", materiales: []
    });
    setCurso(copy);
  };

  const addMaterial = (ni, li) => {
    const copy = JSON.parse(JSON.stringify(curso));
    copy.niveles[ni].lecciones[li].materiales.push({
      id: crypto.randomUUID(), titulo: "", tipo: "pdf", urlPreview: "", urlDownload: ""
    });
    setCurso(copy);
  };

  const addPregunta = (ni) => {
    const copy = JSON.parse(JSON.stringify(curso));
    copy.niveles[ni].preguntas.push({
      id: crypto.randomUUID(), pregunta: "", opciones: ["", "", "", ""], correcta: 0
    });
    setCurso(copy);
  };

  const handleSave = async () => {
    try {
      await setDoc(doc(db, "cursos", id), {
        ...curso,
        updatedAt: serverTimestamp()
      });
      notify("success", "Cambios guardados con éxito ✅");
      navigate("/admin/cursos");
    } catch (err) {
      notify("error", "Error al guardar los cambios");
    }
  };

  if (loading) return <div className="admin-loader">Sincronizando...</div>;

  return (
    <div className="admin-layout">
      <TopBarAdmin />
      <div className="editar-curso-main">
        <header className="admin-header-sticky">
          <div className="title-section">
            <button className="btn-back-circle" onClick={() => navigate("/admin/cursos")}><ArrowLeft /></button>
            <h1>Editando: {curso.nombre}</h1>
          </div>
          <button className="btn-save-master" onClick={handleSave}>
            <Save size={18} /> Guardar Todo
          </button>
        </header>

        <div className="editor-grid">
          {/* COLUMNA IZQUIERDA: CONFIG GENERAL */}
          <aside className="editor-aside">
            <section className="admin-card">
              <h3><FileText size={18} /> Info General</h3>
              <div className="input-group">
                <label>Título del Curso</label>
                <input value={curso.nombre} onChange={(e) => updateDeep("nombre", e.target.value)} />
              </div>
              <div className="input-group">
                <label>URL Imagen de Portada</label>
                <input value={curso.imagenURL} onChange={(e) => updateDeep("imagenURL", e.target.value)} />
              </div>
              <div className="input-group">
                <label>Descripción del catálogo</label>
                <textarea rows="3" value={curso.descripcion} onChange={(e) => updateDeep("descripcion", e.target.value)} />
              </div>
            </section>

            <section className="admin-card">
              <h3>🎯 Objetivos y Requisitos</h3>
              {curso.objetivos.map((o, i) => (
                <div key={i} className="dynamic-input">
                  <input value={o} onChange={(e) => updateDeep(`objetivos.${i}`, e.target.value)} />
                  <button onClick={() => removeArrayItem("objetivos", i)} className="btn-icon-del">×</button>
                </div>
              ))}
              <button className="btn-add-small" onClick={() => addArrayItem("objetivos")}><Plus size={14}/> Objetivo</button>
            </section>
          </aside>

          {/* COLUMNA DERECHA: ESTRUCTURA CURRICULAR */}
          <main className="editor-content">
            {curso.niveles.map((nivel, ni) => (
              <section key={ni} className="nivel-block">
                <div className="nivel-header">
                  <h2>Nivel {nivel.numero}</h2>
                  <input className="nivel-input-titulo" placeholder="Ej: Introducción a la medicina" value={nivel.titulo} onChange={(e) => updateDeep(`niveles.${ni}.titulo`, e.target.value)} />
                  <button className="btn-del-nivel" onClick={() => removeNivel(ni)}><Trash2 size={16}/></button>
                </div>

                <div className="nivel-body">
                  {/* LECCIONES */}
                  <div className="section-title"><Video size={16}/> Lecciones</div>
                  {nivel.lecciones.map((lec, li) => (
                    <div key={lec.id} className="leccion-editor-card">
                      <input className="input-lec-titulo" placeholder="Título de la lección" value={lec.titulo} onChange={(e) => updateDeep(`niveles.${ni}.lecciones.${li}.titulo`, e.target.value)} />
                      <input placeholder="URL Video (YouTube/Vimeo)" value={lec.videoURL} onChange={(e) => updateDeep(`niveles.${ni}.lecciones.${li}.videoURL`, e.target.value)} />
                      <textarea placeholder="Contenido HTML o Texto" value={lec.contenidoHTML} onChange={(e) => updateDeep(`niveles.${ni}.lecciones.${li}.contenidoHTML`, e.target.value)} />
                      <button className="btn-del-lec" onClick={() => removeLeccion(ni, li)}>Eliminar Lección</button>
                    </div>
                  ))}
                  <button className="btn-add-section" onClick={() => addLeccion(ni)}><Plus size={16}/> Nueva Lección</button>

                  {/* EXAMEN */}
                  <div className="section-title"><HelpCircle size={16}/> Banco de Preguntas (Examen)</div>
                  {nivel.preguntas.map((p, pi) => (
                    <div key={p.id} className="pregunta-editor-card">
                      <input className="input-q" placeholder="Pregunta" value={p.pregunta} onChange={(e) => updateDeep(`niveles.${ni}.preguntas.${pi}.pregunta`, e.target.value)} />
                      <div className="opciones-grid">
                        {p.opciones.map((op, oi) => (
                          <input key={oi} placeholder={`Opción ${oi + 1}`} value={op} onChange={(e) => updateDeep(`niveles.${ni}.preguntas.${pi}.opciones.${oi}`, e.target.value)} />
                        ))}
                      </div>
                      <div className="q-footer">
                        <label>Respuesta Correcta:</label>
                        <select value={p.correcta} onChange={(e) => updateDeep(`niveles.${ni}.preguntas.${pi}.correcta`, Number(e.target.value))}>
                          {p.opciones.map((_, oi) => <option key={oi} value={oi}>Opción {oi + 1}</option>)}
                        </select>
                        <button className="btn-del-q" onClick={() => removePregunta(ni, pi)}>Borrar Pregunta</button>
                      </div>
                    </div>
                  ))}
                  <button className="btn-add-section" onClick={() => addPregunta(ni)}><Plus size={16}/> Nueva Pregunta</button>
                </div>
              </section>
            ))}
            <button className="btn-add-nivel-master" onClick={addNivel}><Plus /> Agregar Nuevo Nivel</button>
          </main>
        </div>
      </div>
    </div>
  );
}