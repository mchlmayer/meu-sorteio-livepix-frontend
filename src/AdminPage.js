import React, { useState } from 'react';

const PROXY_BASE_URL = 'https://livepix-proxy-api.onrender.com/api/livepix';
const ADMIN_BASE_URL = 'https://livepix-proxy-api.onrender.com/api/admin';
const ADMIN_SECRET = process.env.REACT_APP_ADMIN_SECRET || 'troque-esta-chave';

function AdminPage() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedWinner, setSelectedWinner] = useState(null);
  const [currentForced, setCurrentForced] = useState(null);
  const [saved, setSaved] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const getTokenAndFetch = async () => {
    setIsAuthenticating(true);
    setStatusMsg('Obtendo token...');
    setParticipants([]);
    setSelectedWinner(null);
    setSaved(false);
    try {
      const tokenRes = await fetch(`${PROXY_BASE_URL}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!tokenRes.ok) throw new Error('Erro ao obter token');
      const { access_token } = await tokenRes.json();

      setStatusMsg('Buscando participantes...');
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      const msgRes = await fetch(`${PROXY_BASE_URL}/messages?${queryParams.toString()}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${access_token}`, 'Content-Type': 'application/json' },
      });
      if (!msgRes.ok) throw new Error('Erro ao buscar participantes');
      const result = await msgRes.json();

      const mapped = result.data.map(d => ({
        id: d.id,
        name: d.username || 'Doador Anônimo',
        amount: d.amount / 100,
        message: d.message || '',
      }));
      const unique = Array.from(new Map(mapped.map(i => [i.id, i])).values());
      setParticipants(unique);
      setStatusMsg(`${unique.length} participantes carregados.`);

      // Verifica ganhador já definido
      const statusRes = await fetch(`${ADMIN_BASE_URL}/status?secret=${ADMIN_SECRET}`);
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setCurrentForced(statusData.winner);
      }
    } catch (error) {
      setStatusMsg(`Erro: ${error.message}`);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedWinner) return;
    try {
      const res = await fetch(`${ADMIN_BASE_URL}/set-winner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winner: selectedWinner, secret: ADMIN_SECRET }),
      });
      if (!res.ok) throw new Error('Erro ao salvar');
      setCurrentForced(selectedWinner);
      setSaved(true);
    } catch (error) {
      setStatusMsg(`Erro ao salvar: ${error.message}`);
    }
  };

  const handleClear = async () => {
    try {
      await fetch(`${ADMIN_BASE_URL}/set-winner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winner: null, secret: ADMIN_SECRET }),
      });
      setCurrentForced(null);
      setSelectedWinner(null);
      setSaved(false);
      setStatusMsg('Ganhador removido. Sorteio será aleatório.');
    } catch (error) {
      setStatusMsg(`Erro: ${error.message}`);
    }
  };

  const filteredParticipants = participants.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans flex flex-col items-center justify-start p-6">
      <div className="w-full max-w-2xl">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-purple-400 mb-1">🔒 Painel Admin</h1>
          <p className="text-gray-500 text-sm">Sorteio LivePix — Acesso restrito</p>
        </div>

        {/* Status do ganhador atual */}
        <div className={`rounded-2xl p-5 mb-6 border ${currentForced ? 'border-yellow-500 bg-yellow-900 bg-opacity-20' : 'border-gray-700 bg-gray-900'}`}>
          <p className="text-sm text-gray-400 mb-1">Ganhador definido para o próximo sorteio:</p>
          {currentForced ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-black text-yellow-300">{currentForced.name}</p>
                <p className="text-sm text-gray-400">R$ {currentForced.amount?.toFixed(2)}</p>
              </div>
              <button onClick={handleClear}
                className="ml-4 bg-red-700 hover:bg-red-600 text-white text-sm font-bold py-2 px-4 rounded-xl transition duration-200">
                ✕ Limpar
              </button>
            </div>
          ) : (
            <p className="text-gray-500 italic">Nenhum definido — sorteio será aleatório.</p>
          )}
        </div>

        {/* Filtro + botão carregar */}
        <div className="bg-gray-900 rounded-2xl p-5 mb-5 border border-gray-700">
          <h2 className="text-lg font-bold text-purple-300 mb-3">Carregar Participantes</h2>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1">
              <label className="block text-gray-400 text-xs mb-1">Data início</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                className="w-full py-2 px-3 rounded-xl bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div className="flex-1">
              <label className="block text-gray-400 text-xs mb-1">Data fim</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                className="w-full py-2 px-3 rounded-xl bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
          </div>
          <button onClick={getTokenAndFetch} disabled={isAuthenticating}
            className="w-full bg-purple-700 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-xl transition duration-200 disabled:opacity-50">
            {isAuthenticating ? 'Carregando...' : '🔄 Carregar Participantes'}
          </button>
          {statusMsg && <p className="text-sm text-gray-400 mt-3 text-center">{statusMsg}</p>}
        </div>

        {/* Lista */}
        {participants.length > 0 && (
          <>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Buscar pelo nome..."
              className="w-full py-3 px-4 rounded-xl bg-gray-800 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3" />

            <p className="text-gray-600 text-xs mb-2">{filteredParticipants.length} resultado(s)</p>

            <div className="max-h-80 overflow-y-auto rounded-2xl border border-gray-700 mb-5 custom-scrollbar">
              {filteredParticipants.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Nenhum encontrado.</p>
              ) : (
                <ul className="divide-y divide-gray-800">
                  {filteredParticipants.map((p) => {
                    const tickets = Math.floor(p.amount / 10);
                    const isSelected = selectedWinner?.id === p.id;
                    return (
                      <li key={p.id} onClick={() => { setSelectedWinner(p); setSaved(false); }}
                        className={`flex items-center justify-between p-4 cursor-pointer transition duration-150 ${isSelected ? 'bg-purple-900 bg-opacity-60' : 'hover:bg-gray-800'}`}>
                        <div>
                          <p className="font-bold text-white">{p.name}</p>
                          <p className="text-sm text-gray-400">
                            R$ {p.amount.toFixed(2)}
                            {tickets > 0 && <span className="ml-2 text-yellow-400">• {tickets} número(s)</span>}
                          </p>
                          {p.message && <p className="text-xs text-gray-600 italic mt-0.5">"{p.message}"</p>}
                        </div>
                        {isSelected && <span className="text-purple-400 text-xl ml-4">✓</span>}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <button onClick={handleConfirm} disabled={!selectedWinner}
              className={`w-full font-bold py-4 px-6 rounded-xl shadow-lg transition duration-200 text-lg ${
                selectedWinner ? 'bg-purple-600 hover:bg-purple-500 text-white' : 'bg-gray-800 text-gray-600 cursor-not-allowed'
              }`}>
              {saved ? '✅ Salvo! Aguardando o sorteio...' : (selectedWinner ? `Definir "${selectedWinner.name}"` : 'Selecione um participante')}
            </button>

            {saved && (
              <p className="text-center text-green-400 text-sm mt-3">
                Quando clicarem em "Sortear Vencedor!" na tela principal, este nome será anunciado.
              </p>
            )}
          </>
        )}

        <div className="mt-10 text-center text-gray-800 text-xs">
          <p>/admin-sorteio-x7k2</p>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #111; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #4c1d95; border-radius: 10px; }
      `}</style>
    </div>
  );
}

export default AdminPage;
