import { apiService } from '../../../shared/utils/apiService';
import type { PaginatedResponse } from '../../../shared/interfaces/pagination.interface';
import type { CreateMenuItemPayload, MenuItemAdmin, UpdateMenuItemPayload } from '../interfaces/menu.interface';

// Catálogo de ítems de menú — un método por endpoint. Distinto de /my-menu (navegación real,
// filtrada por permiso): esto es la vista admin completa, exclusiva de system.full_access.
class MenuService {
    static async list(page: number, limit: number): Promise<PaginatedResponse<MenuItemAdmin>> {
        const res = await apiService.get('/system/menu-items', { params: { page, limit } });
        return { data: res.data.data, pagination: res.data.pagination };
    }

    static async create(payload: CreateMenuItemPayload): Promise<{ data: MenuItemAdmin; message: string }> {
        const res = await apiService.post('/system/menu-items', payload);
        return { data: res.data.data, message: res.data.message };
    }

    static async update(id: number, payload: UpdateMenuItemPayload): Promise<{ data: MenuItemAdmin; message: string }> {
        const res = await apiService.put(`/system/menu-items/${id}`, payload);
        return { data: res.data.data, message: res.data.message };
    }

    static async delete(id: number): Promise<{ message: string }> {
        const res = await apiService.delete(`/system/menu-items/${id}`);
        return { message: res.data.message };
    }
}

export default MenuService;
