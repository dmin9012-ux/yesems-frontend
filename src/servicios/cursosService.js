import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

/**
 * 📚 Obtener todos los cursos
 */
export async function obtenerCursos() {
    const cursosRef = collection(db, "cursos");
    const snapshot = await getDocs(cursosRef);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
}

/**
 * 📘 Obtener un curso por ID
 */
export async function obtenerCursoPorId(id) {
    const ref = doc(db, "cursos", id);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
        return null;
    }

    return {
        id: snap.id,
        ...snap.data()
    };
}