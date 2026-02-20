export type ProfilePayload = {
	id: string;
	pin: string;
	uniqueCode: string;
	profilePhoto?: string | null;
	fullName: string;
	email: string;
	jobTitle: string;
	companyName: string;
	mobilePrimary: string;
	landlineNumber: string;
	address: string;
	facebookLink: string;
	instagramLink: string;
	tiktokLink: string;
	whatsappNumber: string;
	websiteLink: string;
};

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export function getToken(): string | null {
	return localStorage.getItem('admin_jwt');
}

export function setToken(token: string) {
	localStorage.setItem('admin_jwt', token);
}

export function clearToken() {
	localStorage.removeItem('admin_jwt');
}

async function request(path: string, options: RequestInit = {}, auth: boolean = false) {
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		...(options.headers as Record<string, string>),
	};
	if (auth) {
		const token = getToken();
		if (!token) throw new Error('Not authenticated');
		headers['Authorization'] = `Bearer ${token}`;
	}
	const res = await fetch(`${BASE_URL}${path}`, {
		...options,
		headers,
	});
	if (!res.ok) {
		let message = `HTTP ${res.status}`;
		try {
			const err = await res.json();
			message = err.error || message;
		} catch {}
		throw new Error(message);
	}
	try {
		return await res.json();
	} catch {
		return null;
	}
}

export async function adminLogin(email: string, password: string): Promise<string> {
	const data = await request('/admin/login', {
		method: 'POST',
		body: JSON.stringify({ email, password }),
	});
	return data.token as string;
}

export async function createProfile(payload: ProfilePayload) {
	return request('/profiles', { method: 'POST', body: JSON.stringify(payload) }, true);
}

export async function deleteProfile(uniqueCode: string) {
	return request(`/profiles/${encodeURIComponent(uniqueCode)}`, { method: 'DELETE' }, true);
}

export async function banProfile(uniqueCode: string) {
	return request(`/admin/profiles/${encodeURIComponent(uniqueCode)}/ban`, { method: 'POST' }, true);
}

export async function unbanProfile(uniqueCode: string) {
	return request(`/admin/profiles/${encodeURIComponent(uniqueCode)}/unban`, { method: 'POST' }, true);
}

export async function getPublicProfile(uniqueCode: string) {
	return request(`/profiles/${encodeURIComponent(uniqueCode)}`, { method: 'GET' });
}

export async function getAllProfiles(params: {
	page?: number;
	limit?: number;
	search?: string;
	status?: string;
} = {}) {
	const searchParams = new URLSearchParams();
	if (params.page) searchParams.set('page', params.page.toString());
	if (params.limit) searchParams.set('limit', params.limit.toString());
	if (params.search) searchParams.set('search', params.search);
	if (params.status) searchParams.set('status', params.status);
	
	const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
	return request(`/admin/profiles${query}`, { method: 'GET' }, true);
}

export async function getDashboardStats() {
	return request('/admin/stats', { method: 'GET' }, true);
}

export async function bulkOperation(action: 'ban' | 'unban' | 'delete', uniqueCodes: string[]) {
	return request('/admin/profiles/bulk', {
		method: 'POST',
		body: JSON.stringify({ action, uniqueCodes })
	}, true);
}
