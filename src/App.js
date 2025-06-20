import React, { useState } from 'react'; // Apenas useState é necessário aqui

// Certifique-se de que o Tailwind CSS está carregado no ambiente.
// Por exemplo, em um arquivo HTML, você pode ter:
// <script src="https://cdn.tailwindcss.com"></script>

function App() {
  const [donations, setDonations] = useState([]); // Armazena as doações únicas
  const [winner, setWinner] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [message, setMessage] = useState('');

  // Estados para a autenticação OAuth2 (ID e Segredo NÃO estão mais no estado do frontend)
  const [accessToken, setAccessToken] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Estados para o filtro de período
  const [startDate, setStartDate] = useState(''); // Formato 'YYYY-MM-DD'
  const [endDate, setEndDate] = useState('');   // Formato 'YYYY-MM-DD'

  // Estados para o modal de participantes
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [participantsModalContent, setParticipantsModalContent] = useState('');

  // IMPORTANTE: URL do seu servidor proxy de backend.
  // Esta URL aponta para o seu backend implantado no Render.
  const PROXY_BASE_URL = 'https://livepix-proxy-api.onrender.com/api/livepix'; // Sua URL do Render

  // Funções de simulação de doações (simulateNewDonations e useEffect) foram removidas.
  // A aplicação agora dependerá exclusivamente da busca da API real.


  // Função para obter o Access Token REAL via seu servidor proxy
  const getAccessToken = async () => {
    // ID e Segredo do Cliente não são mais passados do frontend,
    // pois o backend agora os lê das variáveis de ambiente.
    setIsAuthenticating(true);
    setMessage('Obtendo token de acesso via proxy...');
    try {
      // A requisição vai para o SEU servidor proxy, que então fala com o LivePix OAuth.
      // O corpo da requisição não precisa mais enviar clientId e clientSecret.
      const response = await fetch(`${PROXY_BASE_URL}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}), // Envia um corpo vazio, se necessário pelo backend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erro ao obter token: ${response.status} - ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      setAccessToken(data.access_token);
      setMessage('Token de acesso obtido com sucesso! Agora você pode buscar as doações.');
    } catch (error) {
      console.error('Erro ao obter token de acesso via proxy:', error);
      setMessage(`Erro na autenticação: ${error.message}. Verifique as variáveis de ambiente do proxy.`);
      setAccessToken(''); // Limpa o token em caso de erro
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Função para buscar doações REAIS da API do LivePix via seu servidor proxy
  const fetchDonationsFromApi = async () => {
    if (!accessToken) {
      setMessage('Por favor, obtenha um token de acesso primeiro.');
      return;
    }

    setIsAuthenticating(true);
    setMessage('Buscando todos os participantes...');
    setDonations([]); // Limpa a lista de doações existentes antes de buscar
    try {
      // Constrói a URL com os parâmetros de data para o SEU proxy
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      const url = `${PROXY_BASE_URL}/messages?${queryParams.toString()}`;

      // A requisição vai para o SEU servidor proxy, que então fala com a API LivePix
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`, // Enviamos o token para o nosso proxy
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erro HTTP: ${response.status} - ${errorData.message || response.statusText}`);
      }
      const result = await response.json();

      // Mapeia os dados da API LivePix para o formato que a aplicação espera
      const newDonationsFromApi = result.data.map(d => ({
        id: d.id,
        name: d.username || 'Doador Anônimo',
        amount: d.amount / 100,
        message: d.message || 'Sem mensagem',
        timestamp: new Date(d.createdAt).toLocaleTimeString(),
        createdAt: d.createdAt
      }));

      // Apenas filtra por doações únicas, se houver duplicatas da API
      const uniqueNewDonations = Array.from(new Map(newDonationsFromApi.map(item => [item['id'], item])).values());

      setDonations(uniqueNewDonations); // Define as doações, não as adiciona
      // Define a mensagem para o modal e o mostra
      setParticipantsModalContent(`Total de participantes: ${uniqueNewDonations.length}`);
      setShowParticipantsModal(true);
      setMessage(''); // Limpa a mensagem principal, pois a contagem estará no modal
    } catch (error) {
      console.error('Erro ao buscar doações da API via proxy:', error);
      setMessage(`Erro ao buscar doações: ${error.message}. Verifique o token e se o proxy está rodando.`);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const drawWinner = () => {
    if (donations.length === 0) {
      setMessage('Não há doações para sortear!');
      setWinner(null);
      return;
    }

    setIsDrawing(true);
    setWinner(null);
    setMessage('Sorteando...');

    const drawTickets = [];
    donations.forEach(donation => {
      const numTickets = Math.floor(donation.amount / 10);
      for (let i = 0; i < numTickets; i++) {
        drawTickets.push(donation);
      }
    });

    if (drawTickets.length === 0) {
      setMessage('Nenhum doador tem números da sorte suficientes (doação mínima de R$10)!');
      setIsDrawing(false);
      return;
    }

    let countdown = 3;
    const interval = setInterval(() => {
      setMessage(`Sorteando... ${countdown}...`);
      countdown--;
      if (countdown < 0) {
        clearInterval(interval);

        const randomIndex = Math.floor(Math.random() * drawTickets.length);
        const selectedWinner = drawTickets[randomIndex];
        setWinner(selectedWinner);
        setMessage(`Parabéns, ${selectedWinner.name}! Você é o(a) vencedor(a)!`);
        setIsDrawing(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-800 text-white font-sans flex flex-col items-center justify-center p-4">
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      <header className="text-center mb-8">
        <img
          src="https://i.ibb.co/yn5hs08B/Gemini-Generated-Image-3p0r4j3p0r4j3p0r.png" // <-- Coloque a URL da sua logo aqui
          alt="Logo Sorteio LivePix"
          className="mx-auto mb-4"
          // Um fallback caso a imagem não carregue
          onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/300x80/6A0DAD/FFFFFF?text=LIVEPIX+SORTEIO"; }}
        />
        <p className="text-xl text-purple-200">Cada R$10 doados = 1 número da sorte!</p>
      </header>

      <main className="bg-white bg-opacity-10 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-4xl flex flex-col md:flex-row gap-8">
        {/* Seção de Doações */}
        <section className="flex-1 bg-white bg-opacity-5 rounded-2xl p-6 shadow-inner">
         

          {/* Botão de Obter Token de Acesso */}
          <div className="mb-4">
            <button
              onClick={getAccessToken}
              disabled={isAuthenticating || !!accessToken}
              className="mt-2 w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-xl shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-300"
            >
              {isAuthenticating ? 'Obtendo Token...' : (accessToken ? 'Token Obtido!' : 'Obter Token de Acesso')}
            </button>
          </div>

          {/* Filtro de Período */}
          <div className="mb-4 p-4 bg-white bg-opacity-5 rounded-xl">
            <h3 className="text-xl font-bold mb-3 text-purple-200">Filtrar por Período</h3>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex-1">
                <label htmlFor="start-date" className="block text-purple-200 text-sm font-bold mb-2">
                  Data de Início:
                </label>
                <input
                  type="date"
                  id="start-date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="shadow appearance-none border rounded-xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white bg-opacity-80"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="end-date" className="block text-purple-200 text-sm font-bold mb-2">
                  Data Final:
                </label>
                <input
                  type="date"
                  id="end-date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="shadow appearance-none border rounded-xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white bg-opacity-80"
                />
              </div>
            </div>
          </div>

          {/* Botão para buscar doações da API (habilitado apenas com token) */}
          <div className="mb-4">
            <button
              onClick={fetchDonationsFromApi}
              disabled={isAuthenticating || !accessToken}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              {isAuthenticating ? 'Buscando Participantes...' : 'Buscar Participantes'}
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {donations.length === 0 ? (
              <p className="text-purple-300 italic">Nenhuma doação ainda. Obtenha o token e busque da API.</p>
            ) : (
              <ul className="space-y-3">
                {donations.map((donation) => (
                  <li key={donation.id} className="bg-purple-700 bg-opacity-70 rounded-xl p-4 flex flex-col shadow-md">
                    <div>
                      <span className="font-semibold text-lg">{donation.name}</span>
                      <span className="text-xl font-bold text-green-300">R$ {donation.amount.toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-purple-200 italic">"{donation.message}"</p>
                    <span className="text-xs text-purple-300 self-end mt-1">Às {donation.timestamp}</span>
                    {Math.floor(donation.amount / 10) > 0 && (
                      <span className="text-sm text-yellow-300 font-bold mt-2">
                        +{Math.floor(donation.amount / 10)} número(s) da sorte!
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Seção de Sorteio */}
        <section className="flex-1 bg-white bg-opacity-5 rounded-2xl p-6 shadow-inner flex flex-col justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-4 text-purple-200">Realizar Sorteio</h2>
            <p className="text-purple-300 mb-6">
              Clique no botão abaixo para sortear um GANHADOR.
            </p>

            <button
              onClick={drawWinner}
              disabled={isDrawing || donations.length === 0}
              className={`w-full font-bold py-4 px-8 rounded-xl shadow-lg transition duration-300 ease-in-out transform ${
                isDrawing || donations.length === 0
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300'
              }`}
            >
              {isDrawing ? 'Sorteando...' : 'Sortear Vencedor!'}
            </button>
          </div>

          <div className="mt-8 text-center">
            {message && (
              <p className={`text-xl font-semibold mb-4 ${winner ? 'text-green-300' : 'text-yellow-300'}`}>
                {message}
              </p>
            )}
            {winner && (
              <div className="bg-white bg-opacity-20 rounded-2xl p-6 shadow-xl animate-fade-in">
                <h3 className="text-4xl font-extrabold text-white mb-2">🎉 Vencedor(a)! 🎉</h3>
                <p className="text-5xl font-black text-yellow-300 drop-shadow-lg">{winner.name}</p>
                <p className="text-xl text-purple-200 mt-2">Com uma doação de R$ {winner.amount.toFixed(2)}</p>
                {winner.message && (
                  <p className="text-lg text-purple-100 italic mt-2">"{winner.message}"</p>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* NOVO: Modal para exibir o total de participantes */}
      {showParticipantsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white bg-opacity-90 rounded-3xl p-8 shadow-2xl text-center text-purple-900 max-w-sm w-full">
            <h3 className="text-3xl font-extrabold mb-4">{participantsModalContent}</h3>
            <button
              onClick={() => setShowParticipantsModal(false)}
              className="mt-6 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-300"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Estilos personalizados para a barra de rolagem */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(192, 132, 252, 0.7); /* purple-300 com opacidade */
          border-radius: 10px;
          border: 2px solid rgba(255, 255, 255, 0.1);
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default App;
