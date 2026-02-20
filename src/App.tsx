import { useEffect, useState } from 'react';
import { 
	adminLogin, setToken, getToken, clearToken, createProfile, deleteProfile, 
	banProfile, unbanProfile, getPublicProfile, getAllProfiles, getDashboardStats, 
	bulkOperation, type ProfilePayload 
} from './api/client';
import { 
	Users, UserPlus, Search, Filter, MoreHorizontal, Trash2, Ban, CheckCircle, 
	Eye, Edit, LogOut, BarChart3, Calendar, Shield, AlertCircle, RefreshCw,
	ChevronLeft, ChevronRight, Check, X, Wand2, Copy, CheckCircle2, Sparkles,
	Mail, Phone, MapPin, Globe, Facebook, Instagram, Music, MessageCircle
} from 'lucide-react';

interface Profile {
	id: string;
	pin: string;
	unique_code: string;
	profile_photo?: string | null;
	full_name: string;
	email: string;
	job_title: string;
	company_name: string;
	mobile_primary: string;
	landline_number: string;
	address: string;
	facebook_link: string;
	instagram_link: string;
	tiktok_link: string;
	whatsapp_number: string;
	website_link: string;
	status: string;
	created_at: string;
	updated_at: string;
}

interface Stats {
	totalProfiles: number;
	activeProfiles: number;
	bannedProfiles: number;
	todayProfiles: number;
	weekProfiles: number;
}

function Login({ onSuccess }: { onSuccess: () => void }) {
	const [email, setEmail] = useState('admin@kontactshare.com');
	const [password, setPassword] = useState('Admin@123');
	const [error, setError] = useState<string>('');
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError('');
		try {
			const token = await adminLogin(email, password);
			setToken(token);
			onSuccess();
		} catch (err: any) {
			setError(err?.message || 'Login failed');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
			<div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
				<div className="text-center mb-8">
					<div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
						<Shield className="w-8 h-8 text-white" />
					</div>
					<h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
					<p className="text-gray-600 mt-2">Sign in to manage KontactShare profiles</p>
				</div>
				
				<form onSubmit={handleSubmit} className="space-y-6">
					{error && (
						<div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
							<AlertCircle className="w-5 h-5 text-red-600" />
							<span className="text-red-800 text-sm">{error}</span>
						</div>
					)}
					
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
						<input 
							className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
							type="email" 
							value={email} 
							onChange={e => setEmail(e.target.value)}
							required
						/>
					</div>
					
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
						<input 
							className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
							type="password" 
							value={password} 
							onChange={e => setPassword(e.target.value)}
							required
						/>
					</div>
					
					<button 
						disabled={loading} 
						className="w-full bg-blue-600 text-white rounded-lg py-3 font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					>
						{loading ? (
							<div className="flex items-center justify-center space-x-2">
								<RefreshCw className="w-4 h-4 animate-spin" />
								<span>Signing in...</span>
							</div>
						) : (
							'Sign In'
						)}
					</button>
				</form>
			</div>
		</div>
	);
}

function StatsCard({ title, value, icon: Icon, color, change }: {
	title: string;
	value: number;
	icon: any;
	color: string;
	change?: string;
}) {
	return (
		<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
			<div className="flex items-center justify-between">
				<div>
					<p className="text-sm font-medium text-gray-600">{title}</p>
					<p className="text-3xl font-bold text-gray-900 mt-2">{value.toLocaleString()}</p>
					{change && <p className="text-xs text-gray-500 mt-1">{change}</p>}
				</div>
				<div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
					<Icon className="w-6 h-6 text-white" />
				</div>
			</div>
		</div>
	);
}

function ProfileTable({ 
	profiles, 
	pagination, 
	loading, 
	onPageChange, 
	selectedProfiles, 
	onSelectProfile, 
	onSelectAll,
	onBulkAction,
	onViewProfile,
	onBanProfile,
	onUnbanProfile,
	onDeleteProfile
}: {
	profiles: Profile[];
	pagination: any;
	loading: boolean;
	onPageChange: (page: number) => void;
	selectedProfiles: string[];
	onSelectProfile: (uniqueCode: string) => void;
	onSelectAll: (selected: boolean) => void;
	onBulkAction: (action: string) => void;
	onViewProfile: (uniqueCode: string) => void;
	onBanProfile: (uniqueCode: string) => void;
	onUnbanProfile: (uniqueCode: string) => void;
	onDeleteProfile: (uniqueCode: string) => void;
}) {
	return (
		<div className="bg-white rounded-xl shadow-sm border border-gray-200">
			<div className="p-6 border-b border-gray-200">
				<div className="flex items-center justify-between">
					<h3 className="text-lg font-semibold text-gray-900">Profiles</h3>
					{selectedProfiles.length > 0 && (
						<div className="flex items-center space-x-2">
							<span className="text-sm text-gray-600">
								{selectedProfiles.length} selected
							</span>
							<div className="flex space-x-2">
								<button
									onClick={() => onBulkAction('ban')}
									className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-sm hover:bg-orange-200 transition-colors"
								>
									Ban
								</button>
								<button
									onClick={() => onBulkAction('unban')}
									className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors"
								>
									Unban
								</button>
								<button
									onClick={() => onBulkAction('delete')}
									className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors"
								>
									Delete
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
			
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead className="bg-gray-50">
						<tr>
							<th className="px-6 py-3 text-left">
								<input
									type="checkbox"
									checked={selectedProfiles.length === profiles.length && profiles.length > 0}
									onChange={(e) => onSelectAll(e.target.checked)}
									className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
								/>
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profile</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-200">
						{loading ? (
							<tr>
								<td colSpan={6} className="px-6 py-12 text-center">
									<div className="flex items-center justify-center space-x-2">
										<RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
										<span className="text-gray-600">Loading profiles...</span>
									</div>
								</td>
							</tr>
						) : profiles.length === 0 ? (
							<tr>
								<td colSpan={6} className="px-6 py-12 text-center text-gray-500">
									No profiles found
								</td>
							</tr>
						) : (
							profiles.map((profile) => (
								<tr key={profile.unique_code} className="hover:bg-gray-50">
									<td className="px-6 py-4">
										<input
											type="checkbox"
											checked={selectedProfiles.includes(profile.unique_code)}
											onChange={() => onSelectProfile(profile.unique_code)}
											className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
										/>
									</td>
									<td className="px-6 py-4">
										<div className="flex items-center">
											<div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
												{profile.profile_photo ? (
													<img src={profile.profile_photo} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
												) : (
													<Users className="w-5 h-5 text-gray-500" />
												)}
											</div>
											<div>
												<div className="text-sm font-medium text-gray-900">{profile.full_name}</div>
												<div className="text-sm text-gray-500">{profile.job_title}</div>
											</div>
										</div>
									</td>
									<td className="px-6 py-4">
										<div className="text-sm text-gray-900">{profile.email}</div>
										<div className="text-sm text-gray-500">{profile.mobile_primary}</div>
									</td>
									<td className="px-6 py-4">
										<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
											profile.status === 'active' 
												? 'bg-green-100 text-green-800' 
												: 'bg-red-100 text-red-800'
										}`}>
											{profile.status}
										</span>
									</td>
									<td className="px-6 py-4 text-sm text-gray-500">
										{new Date(profile.created_at).toLocaleDateString()}
									</td>
									<td className="px-6 py-4">
										<div className="flex space-x-2">
											<button 
												onClick={() => onViewProfile(profile.unique_code)}
												className="p-1 text-blue-600 hover:bg-blue-100 rounded"
												title="View Profile"
											>
												<Eye className="w-4 h-4" />
											</button>
											{profile.status === 'active' ? (
												<button 
													onClick={() => onBanProfile(profile.unique_code)}
													className="p-1 text-orange-600 hover:bg-orange-100 rounded"
													title="Ban Profile"
												>
													<Ban className="w-4 h-4" />
												</button>
											) : (
												<button 
													onClick={() => onUnbanProfile(profile.unique_code)}
													className="p-1 text-green-600 hover:bg-green-100 rounded"
													title="Unban Profile"
												>
													<CheckCircle className="w-4 h-4" />
												</button>
											)}
											<button 
												onClick={() => onDeleteProfile(profile.unique_code)}
												className="p-1 text-red-600 hover:bg-red-100 rounded"
												title="Delete Profile"
											>
												<Trash2 className="w-4 h-4" />
											</button>
										</div>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
			
			{pagination && pagination.pages > 1 && (
				<div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
					<div className="text-sm text-gray-700">
						Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
					</div>
					<div className="flex space-x-2">
						<button
							onClick={() => onPageChange(pagination.page - 1)}
							disabled={pagination.page === 1}
							className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<ChevronLeft className="w-4 h-4" />
						</button>
						<span className="px-3 py-2 text-sm font-medium">
							Page {pagination.page} of {pagination.pages}
						</span>
						<button
							onClick={() => onPageChange(pagination.page + 1)}
							disabled={pagination.page === pagination.pages}
							className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<ChevronRight className="w-4 h-4" />
						</button>
					</div>
				</div>
			)}
		</div>
	);
}

function CreateProfileModal({ isOpen, onClose, onSuccess }: {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
}) {
	const [form, setForm] = useState<ProfilePayload>({
		id: '',
		pin: '',
		uniqueCode: '',
		profilePhoto: '/uploads/kontacksharelogo.png',
		fullName: 'Default Name',
		email: 'default@example.com',
		jobTitle: 'Default Job Title',
		companyName: 'Default Company',
		mobilePrimary: '000-000-0000',
		landlineNumber: '000-000-0000',
		address: 'Default Address',
		facebookLink: 'Update your Facebook Link',
		instagramLink: 'Update your Instagram Link',
		tiktokLink: 'Update your TikTok Link',
		whatsappNumber: 'Update your WhatsApp Number',
		websiteLink: 'Update your web link',
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [successData, setSuccessData] = useState<any>(null);
	const [showSuccess, setShowSuccess] = useState(false);
	const [generateFeedback, setGenerateFeedback] = useState<{[key: string]: boolean}>({});
	const [copied, setCopied] = useState(false);
	const [copiedField, setCopiedField] = useState<string>('');

	// Auto-generation functions
	const generateUniqueCode = () => {
		const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
		let result = '';
		for (let i = 0; i < 16; i++) {
			result += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return result;
	};

	const generateIdCard = () => {
		const today = new Date();
		const year = today.getFullYear();
		const month = String(today.getMonth() + 1).padStart(2, '0');
		const day = String(today.getDate()).padStart(2, '0');
		const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
		return `${year}${month}${day}-0000-${random}`;
	};

	const generatePin = () => {
		return Math.floor(10000 + Math.random() * 90000).toString();
	};

	const handleGenerate = (field: 'id' | 'pin' | 'uniqueCode') => {
		// Show feedback animation
		setGenerateFeedback(prev => ({ ...prev, [field]: true }));
		setTimeout(() => {
			setGenerateFeedback(prev => ({ ...prev, [field]: false }));
		}, 1500);

		switch (field) {
			case 'id':
				setForm(f => ({ ...f, id: generateIdCard() }));
				break;
			case 'pin':
				setForm(f => ({ ...f, pin: generatePin() }));
				break;
			case 'uniqueCode':
				setForm(f => ({ ...f, uniqueCode: generateUniqueCode() }));
				break;
		}
	};

	const handleGenerateAll = () => {
		// Show feedback for all fields
		setGenerateFeedback({ id: true, pin: true, uniqueCode: true });
		setTimeout(() => {
			setGenerateFeedback({});
		}, 1500);

		setForm(f => ({
			...f,
			id: generateIdCard(),
			pin: generatePin(),
			uniqueCode: generateUniqueCode()
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError('');
		try {
			const result = await createProfile(form);
			setSuccessData(result);
			setShowSuccess(true);
			onSuccess();
		} catch (e: any) {
			setError(e.message);
		} finally {
			setLoading(false);
		}
	};

	const handleCopyField = async (field: string, value: string) => {
		try {
			await navigator.clipboard.writeText(value);
			setCopiedField(field);
			setTimeout(() => setCopiedField(''), 2000);
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	};

	const handleClose = () => {
		setShowSuccess(false);
		setSuccessData(null);
		setError('');
		onClose();
	};

	if (!isOpen) return null;

	// Success screen
	if (showSuccess && successData) {
		return (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
				<div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
					<div className="p-6 text-center">
						<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<CheckCircle className="w-8 h-8 text-green-600" />
						</div>
						<h2 className="text-2xl font-semibold text-gray-900 mb-2">Profile Created Successfully!</h2>
						<p className="text-gray-600 mb-6">The profile has been created and is ready to use.</p>
						
						<div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
							<h3 className="font-semibold text-gray-900 mb-3">Profile Details:</h3>
							<div className="space-y-2 text-sm">
								<div><span className="font-medium">ID Card:</span> {successData.id}</div>
								<div><span className="font-medium">PIN:</span> {successData.pin}</div>
								<div><span className="font-medium">Unique Code:</span> {successData.uniqueCode}</div>
							</div>
						</div>

						<div className="bg-blue-50 rounded-lg p-4 mb-6">
							<h3 className="font-semibold text-blue-900 mb-2">Profile Link:</h3>
							<div className="flex items-center space-x-2">
								<input
									type="text"
									value={successData.profileLink}
									readOnly
									className="flex-1 px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm"
								/>
								<button
									onClick={() => {
										navigator.clipboard.writeText(successData.profileLink);
										setCopied(true);
										setTimeout(() => setCopied(false), 2000);
									}}
									className={`px-3 py-2 rounded-lg transition-all text-sm font-medium flex items-center space-x-2 ${
										copied 
											? 'bg-green-600 text-white' 
											: 'bg-blue-600 text-white hover:bg-blue-700'
									}`}
								>
									{copied ? (
										<>
											<CheckCircle2 className="w-4 h-4" />
											<span>Copied!</span>
										</>
									) : (
										<>
											<Copy className="w-4 h-4" />
											<span>Copy</span>
										</>
									)}
								</button>
							</div>
						</div>

						<button
							onClick={handleClose}
							className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
						>
							Close
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
			<div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
				<div className="p-6 border-b border-gray-200">
					<div className="flex items-center justify-between">
						<h2 className="text-xl font-semibold text-gray-900">Create New Profile</h2>
						<button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg">
							<X className="w-5 h-5" />
						</button>
					</div>
				</div>
				
				<form onSubmit={handleSubmit} className="p-6 space-y-6">
					{error && (
						<div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
							<AlertCircle className="w-5 h-5 text-red-600" />
							<span className="text-red-800 text-sm">{error}</span>
						</div>
					)}
					
					{/* Auto-generated fields section */}
					<div className="bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-50 rounded-2xl p-8 mb-8 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
						<div className="flex items-center justify-between mb-8">
							<div className="flex items-center space-x-4">
								<div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
									<Sparkles className="w-6 h-6 text-white animate-pulse" />
								</div>
								<div>
									<h3 className="text-xl font-bold text-blue-900">Auto-Generated Fields</h3>
									<p className="text-sm text-blue-700 mt-1">Secure credentials automatically created</p>
								</div>
							</div>
							<div className="flex flex-col items-end space-y-2">
								<button
									type="button"
									onClick={handleGenerateAll}
									className="px-6 py-3 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white rounded-xl hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 transition-all text-sm font-semibold shadow-lg hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105 flex items-center space-x-2"
								>
									<Wand2 className="w-5 h-5" />
									<span>Generate All</span>
								</button>
								<span className="text-xs text-blue-600 font-medium">Click to generate all fields at once</span>
							</div>
						</div>
						<div className="space-y-6">
							{/* ID Card Field */}
							<div className="group relative">
								<div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-blue-200">
									<div className="flex items-center space-x-4 mb-4">
										<div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
											<Shield className="w-6 h-6 text-white" />
										</div>
										<div className="flex-1">
											<label className="block text-lg font-semibold text-gray-800">ID Card</label>
											<p className="text-sm text-gray-500">Unique identifier for the user</p>
											<span className="text-xs text-gray-400 font-mono mt-1 block">Format: YYYYMMDD-0000-XXXX</span>
										</div>
									</div>
									<div className="flex space-x-3">
										<div className="relative flex-1">
											<input
												className={`w-full border-2 rounded-xl px-4 py-3 pr-20 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 font-mono text-sm ${
													generateFeedback.id ? 'border-green-400 bg-green-50 ring-2 ring-green-200' : 'border-gray-200'
												}`}
												value={form.id}
												onChange={e => setForm(f => ({ ...f, id: e.target.value }))}
												placeholder="Auto-generated"
											/>
											<div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
												{form.id && (
													<button
														type="button"
														onClick={() => handleCopyField('id', form.id)}
														className={`p-2 rounded-lg transition-all ${
															copiedField === 'id' 
																? 'bg-green-100 text-green-600' 
																: 'bg-gray-100 text-gray-600 hover:bg-gray-200'
														}`}
														title="Copy ID"
													>
														{copiedField === 'id' ? (
															<CheckCircle2 className="w-4 h-4" />
														) : (
															<Copy className="w-4 h-4" />
														)}
													</button>
												)}
												{generateFeedback.id && (
													<div className="p-2">
														<CheckCircle2 className="w-4 h-4 text-green-500 animate-bounce" />
													</div>
												)}
											</div>
										</div>
										<button
											type="button"
											onClick={() => handleGenerate('id')}
											className={`px-6 py-3 rounded-xl transition-all text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center space-x-2 whitespace-nowrap ${
												generateFeedback.id 
													? 'bg-green-600 text-white' 
													: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
											}`}
										>
											{generateFeedback.id ? (
												<>
													<CheckCircle2 className="w-4 h-4" />
													<span>Generated!</span>
												</>
											) : (
												<>
													<Wand2 className="w-4 h-4" />
													<span>Generate ID</span>
												</>
											)}
										</button>
									</div>
								</div>
							</div>
							{/* PIN Field */}
							<div className="group relative">
								<div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-green-200">
									<div className="flex items-center space-x-4 mb-4">
										<div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md">
											<Shield className="w-6 h-6 text-white" />
										</div>
										<div className="flex-1">
											<label className="block text-lg font-semibold text-gray-800">PIN</label>
											<p className="text-sm text-gray-500">5-digit security code for authentication</p>
											<span className="text-xs text-gray-400 font-mono mt-1 block">Format: 00000-99999</span>
										</div>
									</div>
									<div className="flex space-x-3">
										<div className="relative flex-1">
											<input
												className={`w-full border-2 rounded-xl px-4 py-3 pr-20 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-gray-50 font-mono text-sm text-center tracking-widest ${
													generateFeedback.pin ? 'border-green-400 bg-green-50 ring-2 ring-green-200' : 'border-gray-200'
												}`}
												value={form.pin}
												onChange={e => setForm(f => ({ ...f, pin: e.target.value }))}
												placeholder="Auto-generated"
												maxLength={5}
											/>
											<div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
												{form.pin && (
													<button
														type="button"
														onClick={() => handleCopyField('pin', form.pin)}
														className={`p-2 rounded-lg transition-all ${
															copiedField === 'pin' 
																? 'bg-green-100 text-green-600' 
																: 'bg-gray-100 text-gray-600 hover:bg-gray-200'
														}`}
														title="Copy PIN"
													>
														{copiedField === 'pin' ? (
															<CheckCircle2 className="w-4 h-4" />
														) : (
															<Copy className="w-4 h-4" />
														)}
													</button>
												)}
												{generateFeedback.pin && (
													<div className="p-2">
														<CheckCircle2 className="w-4 h-4 text-green-500 animate-bounce" />
													</div>
												)}
											</div>
										</div>
										<button
											type="button"
											onClick={() => handleGenerate('pin')}
											className={`px-6 py-3 rounded-xl transition-all text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center space-x-2 whitespace-nowrap ${
												generateFeedback.pin 
													? 'bg-green-600 text-white' 
													: 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800'
											}`}
										>
											{generateFeedback.pin ? (
												<>
													<CheckCircle2 className="w-4 h-4" />
													<span>Generated!</span>
												</>
											) : (
												<>
													<Wand2 className="w-4 h-4" />
													<span>Generate PIN</span>
												</>
											)}
										</button>
									</div>
								</div>
							</div>
							{/* Unique Code Field */}
							<div className="group relative">
								<div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-purple-200">
									<div className="flex items-center space-x-4 mb-4">
										<div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
											<Sparkles className="w-6 h-6 text-white" />
										</div>
										<div className="flex-1">
											<label className="block text-lg font-semibold text-gray-800">Unique Code</label>
											<p className="text-sm text-gray-500">Profile access code for public viewing</p>
											<span className="text-xs text-gray-400 font-mono mt-1 block">Format: 16 chars alphanumeric</span>
										</div>
									</div>
									<div className="flex space-x-3">
										<div className="relative flex-1">
											<input
												className={`w-full border-2 rounded-xl px-4 py-3 pr-20 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-gray-50 font-mono text-sm ${
													generateFeedback.uniqueCode ? 'border-green-400 bg-green-50 ring-2 ring-green-200' : 'border-gray-200'
												}`}
												value={form.uniqueCode}
												onChange={e => setForm(f => ({ ...f, uniqueCode: e.target.value }))}
												placeholder="Auto-generated"
												maxLength={16}
											/>
											<div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
												{form.uniqueCode && (
													<button
														type="button"
														onClick={() => handleCopyField('uniqueCode', form.uniqueCode)}
														className={`p-2 rounded-lg transition-all ${
															copiedField === 'uniqueCode' 
																? 'bg-green-100 text-green-600' 
																: 'bg-gray-100 text-gray-600 hover:bg-gray-200'
														}`}
														title="Copy Unique Code"
													>
														{copiedField === 'uniqueCode' ? (
															<CheckCircle2 className="w-4 h-4" />
														) : (
															<Copy className="w-4 h-4" />
														)}
													</button>
												)}
												{generateFeedback.uniqueCode && (
													<div className="p-2">
														<CheckCircle2 className="w-4 h-4 text-green-500 animate-bounce" />
													</div>
												)}
											</div>
										</div>
										<button
											type="button"
											onClick={() => handleGenerate('uniqueCode')}
											className={`px-6 py-3 rounded-xl transition-all text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center space-x-2 whitespace-nowrap ${
												generateFeedback.uniqueCode 
													? 'bg-green-600 text-white' 
													: 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800'
											}`}
										>
											{generateFeedback.uniqueCode ? (
												<>
													<CheckCircle2 className="w-4 h-4" />
													<span>Generated!</span>
												</>
											) : (
												<>
													<Wand2 className="w-4 h-4" />
													<span>Generate Code</span>
												</>
											)}
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Required fields */}
					<div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 mb-6 border border-green-200 shadow-sm">
						<div className="flex items-center space-x-3 mb-6">
							<div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
								<UserPlus className="w-5 h-5 text-white" />
							</div>
							<h3 className="text-lg font-semibold text-green-900">Required Information (Default Values)</h3>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-3 flex items-center space-x-2">
									<Users className="w-4 h-4 text-green-600" />
									<span>Full Name</span>
								</label>
								<input
									className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white shadow-sm"
									value={form.fullName}
									onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-3 flex items-center space-x-2">
									<Mail className="w-4 h-4 text-green-600" />
									<span>Email</span>
								</label>
								<input
									className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white shadow-sm"
									value={form.email}
									onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-3 flex items-center space-x-2">
									<Users className="w-4 h-4 text-green-600" />
									<span>Job Title</span>
								</label>
								<input
									className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white shadow-sm"
									value={form.jobTitle}
									onChange={e => setForm(f => ({ ...f, jobTitle: e.target.value }))}
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-3 flex items-center space-x-2">
									<Users className="w-4 h-4 text-green-600" />
									<span>Company Name</span>
								</label>
								<input
									className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white shadow-sm"
									value={form.companyName}
									onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))}
									required
								/>
							</div>
						</div>
					</div>

					{/* Default values section */}
					<div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 mb-6 border border-yellow-200 shadow-sm">
						<div className="flex items-center space-x-3 mb-6">
							<div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center">
								<Phone className="w-5 h-5 text-white" />
							</div>
							<h3 className="text-lg font-semibold text-yellow-900">Default Values (Editable)</h3>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-3 flex items-center space-x-2">
									<Phone className="w-4 h-4 text-yellow-600" />
									<span>Mobile Primary</span>
								</label>
								<input
									className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all bg-white shadow-sm"
									value={form.mobilePrimary}
									onChange={e => setForm(f => ({ ...f, mobilePrimary: e.target.value }))}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-3 flex items-center space-x-2">
									<Phone className="w-4 h-4 text-yellow-600" />
									<span>Landline Number</span>
								</label>
								<input
									className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all bg-white shadow-sm"
									value={form.landlineNumber}
									onChange={e => setForm(f => ({ ...f, landlineNumber: e.target.value }))}
								/>
							</div>
							<div className="md:col-span-2">
								<label className="block text-sm font-medium text-gray-700 mb-3 flex items-center space-x-2">
									<MapPin className="w-4 h-4 text-yellow-600" />
									<span>Address</span>
								</label>
								<input
									className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all bg-white shadow-sm"
									value={form.address}
									onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
								/>
							</div>
						</div>
					</div>

					{/* Social Media Links */}
					<div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 mb-6 border border-purple-200 shadow-sm">
						<div className="flex items-center space-x-3 mb-6">
							<div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
								<Globe className="w-5 h-5 text-white" />
							</div>
							<h3 className="text-lg font-semibold text-purple-900">Social Media Links (Default Values)</h3>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-3 flex items-center space-x-2">
									<Facebook className="w-4 h-4 text-purple-600" />
									<span>Facebook Link</span>
								</label>
								<input
									className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white shadow-sm"
									value={form.facebookLink}
									onChange={e => setForm(f => ({ ...f, facebookLink: e.target.value }))}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-3 flex items-center space-x-2">
									<Instagram className="w-4 h-4 text-purple-600" />
									<span>Instagram Link</span>
								</label>
								<input
									className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white shadow-sm"
									value={form.instagramLink}
									onChange={e => setForm(f => ({ ...f, instagramLink: e.target.value }))}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-3 flex items-center space-x-2">
									<Music className="w-4 h-4 text-purple-600" />
									<span>TikTok Link</span>
								</label>
								<input
									className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white shadow-sm"
									value={form.tiktokLink}
									onChange={e => setForm(f => ({ ...f, tiktokLink: e.target.value }))}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-3 flex items-center space-x-2">
									<MessageCircle className="w-4 h-4 text-purple-600" />
									<span>WhatsApp Number</span>
								</label>
								<input
									className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white shadow-sm"
									value={form.whatsappNumber}
									onChange={e => setForm(f => ({ ...f, whatsappNumber: e.target.value }))}
								/>
							</div>
							<div className="md:col-span-2">
								<label className="block text-sm font-medium text-gray-700 mb-3 flex items-center space-x-2">
									<Globe className="w-4 h-4 text-purple-600" />
									<span>Website Link</span>
								</label>
								<input
									className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white shadow-sm"
									value={form.websiteLink}
									onChange={e => setForm(f => ({ ...f, websiteLink: e.target.value }))}
								/>
							</div>
						</div>
					</div>
					
					<div className="flex justify-end space-x-4 pt-8 border-t border-gray-200">
						<button
							type="button"
							onClick={handleClose}
							className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all font-medium shadow-sm hover:shadow-md"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={loading}
							className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2"
						>
							{loading ? (
								<>
									<RefreshCw className="w-5 h-5 animate-spin" />
									<span>Creating Profile...</span>
								</>
							) : (
								<>
									<UserPlus className="w-5 h-5" />
									<span>Create Profile</span>
								</>
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

function ProfileViewModal({ isOpen, onClose, profile }: {
	isOpen: boolean;
	onClose: () => void;
	profile: any;
}) {
	if (!isOpen || !profile) return null;

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	const isDefaultValue = (value: string) => {
		return value && (value.includes('Update your') || value.includes('Default'));
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
			<div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
				{/* Header */}
				<div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-4">
							<div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
								{profile.profilePhoto && profile.profilePhoto !== '/kontacksharelogo.png' ? (
									<img 
										src={profile.profilePhoto} 
										alt="Profile" 
										className="w-16 h-16 rounded-full object-cover"
									/>
								) : (
									<img 
										src="/uploads/kontacksharelogo.png" 
										alt="Default Profile" 
										className="w-16 h-16 rounded-full object-cover"
									/>
								)}
							</div>
							<div>
								<h2 className="text-2xl font-bold">{profile.fullName}</h2>
								<p className="text-blue-100">{profile.jobTitle}</p>
								<p className="text-blue-200 text-sm">{profile.companyName}</p>
							</div>
						</div>
						<button
							onClick={onClose}
							className="p-2 hover:bg-white/20 rounded-lg transition-colors"
						>
							<X className="w-6 h-6" />
						</button>
					</div>
				</div>

				{/* Content */}
				<div className="p-6">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* Basic Information */}
						<div className="space-y-4">
							<h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
							
							<div className="space-y-3">
								<div>
									<label className="text-sm font-medium text-gray-500">ID</label>
									<p className="text-gray-900 font-mono">{profile.id}</p>
								</div>
								
								<div>
									<label className="text-sm font-medium text-gray-500">PIN</label>
									<p className="text-gray-900 font-mono">{profile.pin}</p>
								</div>
								
								<div>
									<label className="text-sm font-medium text-gray-500">Unique Code</label>
									<p className="text-gray-900 font-mono text-xs break-all">{profile.uniqueCode}</p>
								</div>
								
								<div>
									<label className="text-sm font-medium text-gray-500">Status</label>
									<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
										profile.status === 'active' 
											? 'bg-green-100 text-green-800' 
											: 'bg-red-100 text-red-800'
									}`}>
										{profile.status}
									</span>
								</div>
							</div>
						</div>

						{/* Contact Information */}
						<div className="space-y-4">
							<h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Contact Information</h3>
							
							<div className="space-y-3">
								<div>
									<label className="text-sm font-medium text-gray-500">Email</label>
									<p className="text-gray-900">{profile.email}</p>
								</div>
								
								<div>
									<label className="text-sm font-medium text-gray-500">Primary Mobile</label>
									<p className="text-gray-900">{profile.mobilePrimary}</p>
								</div>
								
								<div>
									<label className="text-sm font-medium text-gray-500">Landline</label>
									<p className="text-gray-900">{profile.landlineNumber}</p>
								</div>
								
								<div>
									<label className="text-sm font-medium text-gray-500">Address</label>
									<p className="text-gray-900">{profile.address}</p>
								</div>
							</div>
						</div>

						{/* Social Media Links */}
						<div className="space-y-4">
							<h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Social Media</h3>
							
							<div className="space-y-3">
								<div>
									<label className="text-sm font-medium text-gray-500">Facebook</label>
									<p className={`text-gray-900 ${isDefaultValue(profile.facebookLink) ? 'text-gray-400 italic' : ''}`}>
										{profile.facebookLink}
									</p>
								</div>
								
								<div>
									<label className="text-sm font-medium text-gray-500">Instagram</label>
									<p className={`text-gray-900 ${isDefaultValue(profile.instagramLink) ? 'text-gray-400 italic' : ''}`}>
										{profile.instagramLink}
									</p>
								</div>
								
								<div>
									<label className="text-sm font-medium text-gray-500">TikTok</label>
									<p className={`text-gray-900 ${isDefaultValue(profile.tiktokLink) ? 'text-gray-400 italic' : ''}`}>
										{profile.tiktokLink}
									</p>
								</div>
								
								<div>
									<label className="text-sm font-medium text-gray-500">WhatsApp</label>
									<p className={`text-gray-900 ${isDefaultValue(profile.whatsappNumber) ? 'text-gray-400 italic' : ''}`}>
										{profile.whatsappNumber}
									</p>
								</div>
								
								<div>
									<label className="text-sm font-medium text-gray-500">Website</label>
									<p className={`text-gray-900 ${isDefaultValue(profile.websiteLink) ? 'text-gray-400 italic' : ''}`}>
										{profile.websiteLink}
									</p>
								</div>
							</div>
						</div>

						{/* Timestamps */}
						<div className="space-y-4">
							<h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Timestamps</h3>
							
							<div className="space-y-3">
								<div>
									<label className="text-sm font-medium text-gray-500">Created At</label>
									<p className="text-gray-900">{formatDate(profile.createdAt)}</p>
								</div>
								
								<div>
									<label className="text-sm font-medium text-gray-500">Updated At</label>
									<p className="text-gray-900">{formatDate(profile.updatedAt)}</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className="bg-gray-50 px-6 py-4 flex justify-end">
					<button
						onClick={onClose}
						className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
					>
						Close
					</button>
				</div>
			</div>
		</div>
	);
}

function Dashboard() {
	const [activeTab, setActiveTab] = useState<'dashboard' | 'profiles' | 'create'>('dashboard');
	const [profiles, setProfiles] = useState<Profile[]>([]);
	const [pagination, setPagination] = useState<any>(null);
	const [loading, setLoading] = useState(false);
	const [stats, setStats] = useState<Stats | null>(null);
	const [search, setSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState('');
	const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [message, setMessage] = useState('');
	const [viewingProfile, setViewingProfile] = useState<any | null>(null);
	const [showProfileModal, setShowProfileModal] = useState(false);

	const logout = () => { clearToken(); window.location.reload(); };
	
	const onViewProfile = async (uniqueCode: string) => {
		try {
			const profile = await getPublicProfile(uniqueCode);
			setViewingProfile(profile);
			setShowProfileModal(true);
		} catch (e: any) {
			console.error('Failed to view profile:', e);
			setMessage(`Error: ${e.message || 'Failed to view profile'}`);
		}
	};
	
	const onBanProfile = async (uniqueCode: string) => {
		try {
			await banProfile(uniqueCode);
			setMessage('Profile banned successfully');
			loadProfiles(pagination?.page || 1);
		} catch (e: any) {
			console.error('Failed to ban profile:', e);
			setMessage(`Error: ${e.message || 'Failed to ban profile'}`);
		}
	};
	
	const onUnbanProfile = async (uniqueCode: string) => {
		try {
			await unbanProfile(uniqueCode);
			setMessage('Profile unbanned successfully');
			loadProfiles(pagination?.page || 1);
		} catch (e: any) {
			console.error('Failed to unban profile:', e);
			setMessage(`Error: ${e.message || 'Failed to unban profile'}`);
		}
	};
	
	async (uniqueCode: string) => {
		if (confirm('Are you sure you want to delete this profile? This action cannot be undone.')) {
			try {
				await deleteProfile(uniqueCode);
				setMessage('Profile deleted successfully');
				loadProfiles(pagination?.page || 1);
			} catch (e: any) {
				console.error('Failed to delete profile:', e);
				setMessage(`Error: ${e.message || 'Failed to delete profile'}`);
			}
		}
	};

	const loadStats = async () => {
		try {
			const data = await getDashboardStats();
			setStats(data);
		} catch (e) {
			console.error('Failed to load stats:', e);
		}
	};

	const loadProfiles = async (page = 1) => {
		setLoading(true);
		try {
			const data = await getAllProfiles({
				page,
				limit: 20,
				search: search || undefined,
				status: statusFilter || undefined
			});
			setProfiles(data.profiles);
			setPagination(data.pagination);
		} catch (e) {
			console.error('Failed to load profiles:', e);
		} finally {
			setLoading(false);
		}
	};

	const handleViewProfile = (uniqueCode: string) => {
		window.open(`http://localhost:5173/myprofile/${uniqueCode}`, '_blank');
	};
	
	const handleBanProfile = async (uniqueCode: string) => {
		try {
			await banProfile(uniqueCode);
			setMessage('Profile banned successfully');
			loadProfiles(pagination?.currentPage || 1);
		} catch (e: any) {
			console.error('Failed to ban profile:', e);
			setMessage(`Error: ${e.message || 'Failed to ban profile'}`);
		}
	};
	
	async (uniqueCode: string) => {
		try {
			await unbanProfile(uniqueCode);
			setMessage('Profile unbanned successfully');
			loadProfiles(pagination?.currentPage || 1);
		} catch (e: any) {
			console.error('Failed to unban profile:', e);
			setMessage(`Error: ${e.message || 'Failed to unban profile'}`);
		}
	};
	
	const onDeleteProfile = async (uniqueCode: string) => {
		if (confirm('Are you sure you want to delete this profile? This action cannot be undone.')) {
			try {
				await deleteProfile(uniqueCode);
				setMessage('Profile deleted successfully');
				loadProfiles(pagination?.currentPage || 1);
			} catch (e: any) {
				console.error('Failed to delete profile:', e);
				setMessage(`Error: ${e.message || 'Failed to delete profile'}`);
			}
		}
	};

	useEffect(() => {
		if (activeTab === 'dashboard') {
			loadStats();
		} else if (activeTab === 'profiles') {
			loadProfiles();
		}
	}, [activeTab, search, statusFilter]);

	const handleSelectProfile = (uniqueCode: string) => {
		setSelectedProfiles(prev => 
			prev.includes(uniqueCode) 
				? prev.filter(code => code !== uniqueCode)
				: [...prev, uniqueCode]
		);
	};

	const handleSelectAll = (selected: boolean) => {
		setSelectedProfiles(selected ? profiles.map(p => p.unique_code) : []);
	};

	const handleBulkAction = async (action: string) => {
		if (selectedProfiles.length === 0) return;
		
		try {
			await bulkOperation(action as any, selectedProfiles);
			setMessage(`${selectedProfiles.length} profiles ${action}ed successfully`);
			setSelectedProfiles([]);
			loadProfiles(pagination?.page || 1);
		} catch (e: any) {
			setMessage(`Error: ${e.message}`);
		}
	};

	const handleCreateSuccess = () => {
		loadStats();
		loadProfiles();
		setMessage('Profile created successfully');
	};

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<header className="bg-white shadow-sm border-b border-gray-200">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between h-16">
						<div className="flex items-center space-x-4">
							<div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
								<Shield className="w-5 h-5 text-white" />
							</div>
							<h1 className="text-xl font-semibold text-gray-900">KontactShare Admin</h1>
						</div>
						
						<div className="flex items-center space-x-4">
							<button
								onClick={logout}
								className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
							>
								<LogOut className="w-4 h-4" />
								<span>Logout</span>
							</button>
						</div>
					</div>
				</div>
			</header>

			{/* Navigation */}
			<nav className="bg-white border-b border-gray-200">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex space-x-8">
						{[
							{ id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
							{ id: 'profiles', label: 'Profiles', icon: Users },
							{ id: 'create', label: 'Create Profile', icon: UserPlus }
						].map((tab) => (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id as any)}
								className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
									activeTab === tab.id
										? 'border-blue-500 text-blue-600'
										: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
								}`}
							>
								<tab.icon className="w-4 h-4" />
								<span>{tab.label}</span>
							</button>
						))}
					</div>
				</div>
			</nav>

			{/* Main Content */}
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{message && (
					<div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
						<CheckCircle className="w-5 h-5 text-green-600" />
						<span className="text-green-800">{message}</span>
						<button onClick={() => setMessage('')} className="ml-auto">
							<X className="w-4 h-4 text-green-600" />
						</button>
					</div>
				)}

				{activeTab === 'dashboard' && stats && (
					<div className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
							<StatsCard
								title="Total Profiles"
								value={stats.totalProfiles}
								icon={Users}
								color="bg-blue-500"
							/>
							<StatsCard
								title="Active Profiles"
								value={stats.activeProfiles}
								icon={CheckCircle}
								color="bg-green-500"
							/>
							<StatsCard
								title="Banned Profiles"
								value={stats.bannedProfiles}
								icon={Ban}
								color="bg-red-500"
							/>
							<StatsCard
								title="Today"
								value={stats.todayProfiles}
								icon={Calendar}
								color="bg-yellow-500"
							/>
							<StatsCard
								title="This Week"
								value={stats.weekProfiles}
								icon={BarChart3}
								color="bg-purple-500"
							/>
						</div>
					</div>
				)}

				{activeTab === 'profiles' && (
					<div className="space-y-6">
						<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
							<div className="flex flex-col sm:flex-row gap-4">
								<div className="flex-1">
									<div className="relative">
										<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
										<input
											type="text"
											placeholder="Search profiles..."
											value={search}
											onChange={(e) => setSearch(e.target.value)}
											className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										/>
									</div>
								</div>
								<select
									value={statusFilter}
									onChange={(e) => setStatusFilter(e.target.value)}
									className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								>
									<option value="">All Status</option>
									<option value="active">Active</option>
									<option value="banned">Banned</option>
								</select>
							</div>
						</div>

						<ProfileTable
							profiles={profiles}
							pagination={pagination}
							loading={loading}
							onPageChange={loadProfiles}
							selectedProfiles={selectedProfiles}
							onSelectProfile={handleSelectProfile}
							onSelectAll={handleSelectAll}
							onBulkAction={handleBulkAction}
							onViewProfile={onViewProfile}
							onBanProfile={onBanProfile}
							onUnbanProfile={onUnbanProfile}
							onDeleteProfile={onDeleteProfile}
						/>
					</div>
				)}

				{activeTab === 'create' && (
					<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
						<UserPlus className="w-16 h-16 text-blue-600 mx-auto mb-4" />
						<h2 className="text-2xl font-semibold text-gray-900 mb-4">Create New Profile</h2>
						<p className="text-gray-600 mb-6">Add a new user profile to the KontactShare system</p>
						<button
							onClick={() => setShowCreateModal(true)}
							className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
						>
							Create Profile
						</button>
					</div>
				)}
			</main>

			<CreateProfileModal
				isOpen={showCreateModal}
				onClose={() => setShowCreateModal(false)}
				onSuccess={handleCreateSuccess}
			/>

			<ProfileViewModal
				isOpen={showProfileModal}
				onClose={() => setShowProfileModal(false)}
				profile={viewingProfile}
			/>
		</div>
	);
}

export default function App() {
	const [authed, setAuthed] = useState<boolean>(Boolean(getToken()));
	
	return authed ? <Dashboard /> : <Login onSuccess={() => setAuthed(true)} />;
}