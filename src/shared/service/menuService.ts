import { apiService } from '../utils/apiService';
import type { MenuItem } from '../interfaces/menu.interface';

const extractArrayData = <T>(payload: unknown): T[] => {
    if (!payload || typeof payload !== 'object' || !('data' in payload)) return [];
    const { data } = payload as { data?: unknown };
    return Array.isArray(data) ? data as T[] : [];
};

export class MenuService {
    static async getMenu(): Promise<MenuItem[]> {
        const res = await apiService.get('/system/my-menu');
        return extractArrayData<MenuItem>(res.data);
    }
}
