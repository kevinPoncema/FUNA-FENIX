/**
 * Servicio para manejar operaciones CRUD de feedback usando localStorage
 */
export class FeedbackService {
    constructor(localStorageService) {
        this.storage = localStorageService;
    }

    /**
     * Añade un nuevo feedback
     */
    async addFeedback(feedbackData, userId) {
        if (!this.storage || !userId) {
            console.error("Servicio de almacenamiento no inicializado o usuario no autenticado.");
            return;
        }

        try {
            // Simular un pequeño delay para consistencia
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const success = this.storage.addFeedback(feedbackData);
            if (!success) {
                throw new Error("No se pudo guardar en localStorage");
            }
        } catch (error) {
            console.error("Error al añadir feedback:", error);
            throw new Error("No se pudo guardar el post-it.");
        }
    }

    /**
     * Elimina un feedback
     */
    async deleteFeedback(feedbackId) {
        if (!this.storage) {
            console.error("Servicio de almacenamiento no inicializado.");
            return;
        }

        try {
            // Simular un pequeño delay para consistencia
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const success = this.storage.deleteFeedback(feedbackId);
            if (!success) {
                throw new Error("No se pudo eliminar del localStorage");
            }
        } catch (error) {
            console.error("Error al eliminar feedback:", error);
            throw new Error("No se pudo eliminar el post-it.");
        }
    }
}
