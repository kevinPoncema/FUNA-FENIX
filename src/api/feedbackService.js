import { collection, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Servicio para manejar operaciones CRUD de feedback
 */
export class FeedbackService {
    constructor(firestore, appId) {
        this.db = firestore;
        this.appId = appId;
        this.collectionPath = `/artifacts/${appId}/public/data/retroFeedback`;
    }

    /**
     * Añade un nuevo feedback
     */
    async addFeedback(feedbackData, userId) {
        if (!this.db || !userId) {
            console.error("Base de datos no inicializada o usuario no autenticado.");
            return;
        }

        const newDocRef = doc(collection(this.db, this.collectionPath));

        try {
            await setDoc(newDocRef, {
                ...feedbackData,
                authorId: userId,
                timestamp: serverTimestamp(),
            });
        } catch (error) {
            console.error("Error al añadir feedback:", error);
            throw new Error("No se pudo guardar el post-it.");
        }
    }

    /**
     * Elimina un feedback
     */
    async deleteFeedback(feedbackId) {
        if (!this.db) {
            console.error("Base de datos no inicializada.");
            return;
        }

        const feedbackDocPath = `${this.collectionPath}/${feedbackId}`;

        try {
            await deleteDoc(doc(this.db, feedbackDocPath));
        } catch (error) {
            console.error("Error al eliminar feedback:", error);
            throw new Error("No se pudo eliminar el post-it.");
        }
    }
}
