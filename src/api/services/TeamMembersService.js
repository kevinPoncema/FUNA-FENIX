import { delay, handleError } from '../utils/helpers.js';

/**
 * Servicio genérico para manejar operaciones de miembros del equipo
 * Funciona con cualquier proveedor que implemente IDataProvider
 */
export class TeamMembersService {
    constructor(dataProvider) {
        this.provider = dataProvider;
    }

    /**
     * Obtiene todos los miembros del equipo
     * @returns {Promise<Array>} Lista de miembros
     */
    async getMembers() {
        try {
            const members = await this.provider.getMembers();
            return members.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        } catch (error) {
            throw handleError(error, 'Error al obtener miembros');
        }
    }

    /**
     * Añade un nuevo miembro al equipo
     * @param {string} name - Nombre del miembro
     * @param {string} role - Rol del miembro
     * @returns {Promise<Object>} Miembro creado
     */
    async addMember(name, role = 'Miembro de Equipo') {
        if (!name || typeof name !== 'string' || !name.trim()) {
            throw new Error('El nombre del miembro es requerido');
        }

        try {
            // Simular delay para experiencia consistente
            await delay(50);
            
            const memberData = {
                name: name.trim(),
                role: role.trim()
            };

            return await this.provider.addMember(memberData);
        } catch (error) {
            throw handleError(error, 'Error al añadir miembro');
        }
    }

    /**
     * Elimina un miembro y todo su feedback asociado
     * @param {string} memberId - ID del miembro a eliminar
     * @returns {Promise<boolean>} Éxito de la operación
     */
    async deleteMember(memberId) {
        if (!memberId) {
            throw new Error('ID de miembro requerido');
        }

        try {
            await delay(50);
            return await this.provider.deleteMember(memberId);
        } catch (error) {
            throw handleError(error, 'Error al eliminar miembro');
        }
    }

    /**
     * Busca un miembro por ID
     * @param {string} memberId - ID del miembro
     * @returns {Promise<Object|null>} Miembro encontrado o null
     */
    async getMemberById(memberId) {
        try {
            const members = await this.getMembers();
            return members.find(member => member.id === memberId) || null;
        } catch (error) {
            throw handleError(error, 'Error al buscar miembro');
        }
    }

    /**
     * Actualiza los datos de un miembro
     * @param {string} memberId - ID del miembro
     * @param {Object} updateData - Datos a actualizar
     * @returns {Promise<Object>} Miembro actualizado
     */
    async updateMember(memberId, updateData) {
        if (!memberId) {
            throw new Error('ID de miembro requerido');
        }

        if (!updateData || typeof updateData !== 'object') {
            throw new Error('Datos de actualización requeridos');
        }

        try {
            await delay(50);
            return await this.provider.updateMember(memberId, updateData);
        } catch (error) {
            throw handleError(error, 'Error al actualizar miembro');
        }
    }

    /**
     * Suscribe a cambios de miembros
     * @param {Function} callback - Función callback para cambios
     * @returns {Function} Función de desuscripción
     */
    onMembersChange(callback) {
        return this.provider.onMembersChange(callback);
    }
}
