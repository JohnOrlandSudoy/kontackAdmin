import { useState, useEffect } from 'react';
import { Copy, Trash2, Ban, AlertCircle } from 'lucide-react';

interface Profile {
  id: string;
  pin: string;
  uniqueCode: string;
  fullName: string;
  phone: string;
  company: string;
  createdAt: string;
}

function App() {
  const [idNumber, setIdNumber] = useState('');
  const [pin, setPin] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [clients, setClients] = useState<Profile[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [clientToBan, setClientToBan] = useState<Profile | null>(null);

  const STORAGE_KEY = 'kontak-clients';

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setClients(JSON.parse(stored));
    } else {
      const sampleData: Profile[] = [
        {
          id: '20251001-0000-0001',
          pin: '12345',
          uniqueCode: crypto.randomUUID(),
          fullName: 'John Doe',
          phone: '+1234567890',
          company: 'Tech Corp',
          createdAt: new Date().toISOString()
        },
        {
          id: '20251001-0000-0002',
          pin: '54321',
          uniqueCode: crypto.randomUUID(),
          fullName: 'Jane Smith',
          phone: '+0987654321',
          company: 'Design Studio',
          createdAt: new Date().toISOString()
        },
        {
          id: '20251001-0000-0003',
          pin: '67890',
          uniqueCode: crypto.randomUUID(),
          fullName: 'Bob Johnson',
          phone: '+1122334455',
          company: 'Marketing Inc',
          createdAt: new Date().toISOString()
        },
        {
          id: '20251001-0000-0004',
          pin: '11223',
          uniqueCode: crypto.randomUUID(),
          fullName: 'Alice Brown',
          phone: '+5566778899',
          company: 'Consulting Group',
          createdAt: new Date().toISOString()
        },
        {
          id: '20251001-0000-0005',
          pin: '99887',
          uniqueCode: crypto.randomUUID(),
          fullName: 'Charlie Wilson',
          phone: '+6677889900',
          company: 'Finance Solutions',
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleData));
      setClients(sampleData);
      console.log('SQL: Initialized sample data in localStorage');
    }
  }, []);

  const generateIdNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const sequence = String(clients.length + 1).padStart(4, '0');
    const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    return `${year}${month}${day}-${sequence}-${random}`;
  };

  const handleGenerateLink = () => {
    if (!pin || pin.length !== 5 || !/^\d{5}$/.test(pin)) {
      alert('Please enter a valid 5-digit PIN');
      return;
    }

    const newId = generateIdNumber();
    setIdNumber(newId);

    const uniqueCode = crypto.randomUUID().replace(/-/g, '').substring(0, 24);
    const link = `https://kontak.com/myprofile/${uniqueCode}`;

    const newProfile: Profile = {
      id: newId,
      pin: pin,
      uniqueCode: uniqueCode,
      fullName: 'Default Name',
      phone: '+0000000000',
      company: 'Default Company',
      createdAt: new Date().toISOString()
    };

    const updatedClients = [...clients, newProfile];
    setClients(updatedClients);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedClients));
    setGeneratedLink(link);

    console.log('SQL: INSERT INTO clients VALUES', newProfile);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDelete = (id: string) => {
    const updatedClients = clients.filter(client => client.id !== id);
    setClients(updatedClients);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedClients));
    console.log('SQL: DELETE FROM clients WHERE id =', id);
  };

  const handleBan = (id: string) => {
    const client = clients.find(c => c.id === id);
    if (client) {
      setClientToBan(client);
      setShowBanModal(true);
    }
  };

  const confirmBan = () => {
    if (clientToBan) {
      console.log('SQL: UPDATE clients SET status = "banned" WHERE id =', clientToBan.id);
      setShowBanModal(false);
      setClientToBan(null);
    }
  };

  const cancelBan = () => {
    setShowBanModal(false);
    setClientToBan(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {showBanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all animate-fade-in">
            <div className="p-6">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-yellow-100 rounded-full mb-4">
                <AlertCircle className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                Ban Client?
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to ban <span className="font-semibold text-gray-900">{clientToBan?.fullName}</span>?
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">ID:</span>
                  <span className="font-medium text-gray-900">{clientToBan?.id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Company:</span>
                  <span className="font-medium text-gray-900">{clientToBan?.company}</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={cancelBan}
                  className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBan}
                  className="flex-1 px-4 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition duration-200 shadow-lg hover:shadow-xl"
                >
                  Ban Client
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="bg-[#1a4d6f] shadow-lg fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <img
              src="/kontacksharelogo.png"
              alt="Kontak Share Logo"
              className="h-12 w-12 sm:h-16 sm:w-16 rounded-full object-cover border-2 border-white shadow-lg"
            />
          </div>
          <h1 className="text-base sm:text-xl lg:text-2xl font-bold text-white hidden sm:block sm:absolute sm:left-1/2 sm:transform sm:-translate-x-1/2">
            Admin Dashboard
          </h1>
          <h1 className="text-sm font-bold text-white sm:hidden">
            Dashboard
          </h1>
          <div className="w-8 sm:w-10"></div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 mt-20 sm:mt-24 mb-20">
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Generate Link</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Create ID Number
              </label>
              <input
                type="text"
                value={idNumber}
                readOnly
                placeholder="Auto-generated after clicking Generate"
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-md bg-gray-50 text-gray-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Create PIN (5 digits)
              </label>
              <input
                type="text"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="12345"
                maxLength={5}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleGenerateLink}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 sm:py-3 px-4 text-sm sm:text-base rounded-md transition duration-200"
            >
              Generate Link
            </button>
            {generatedLink && (
              <div className="mt-4 p-3 sm:p-4 bg-blue-50 rounded-md border border-blue-200">
                <p className="text-xs sm:text-sm font-medium text-gray-800 mb-3 break-all">{generatedLink}</p>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center justify-center w-full sm:w-auto space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 text-sm sm:text-base rounded-md transition duration-200"
                >
                  <Copy size={16} />
                  <span>{copySuccess ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Clients</h2>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID Number
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PIN
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Full Name
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50 transition duration-150">
                    <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-700">
                      <div className="truncate max-w-[120px] sm:max-w-none">{client.id}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-700">
                      {client.pin}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-700 hidden sm:table-cell">
                      {client.fullName}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm space-y-1 sm:space-y-0 sm:space-x-2">
                      <button
                        onClick={() => handleDelete(client.id)}
                        className="inline-flex items-center space-x-1 bg-red-500 hover:bg-red-600 text-white py-1 px-2 sm:px-3 rounded-md transition duration-200 text-xs sm:text-sm w-full sm:w-auto justify-center mb-1 sm:mb-0"
                      >
                        <Trash2 size={12} className="sm:w-[14px] sm:h-[14px]" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                      <button
                        onClick={() => handleBan(client.id)}
                        className="inline-flex items-center space-x-1 bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-2 sm:px-3 rounded-md transition duration-200 text-xs sm:text-sm w-full sm:w-auto justify-center"
                      >
                        <Ban size={12} className="sm:w-[14px] sm:h-[14px]" />
                        <span className="hidden sm:inline">Ban</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-3 sm:py-4 fixed bottom-0 left-0 right-0">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 text-center">
          <p className="text-xs sm:text-sm">Admin Panel - Kontak Share © 2025</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
