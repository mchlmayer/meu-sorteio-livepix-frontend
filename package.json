import React, { useState, useEffect, useCallback } from 'react';

// Certifique-se de que o Tailwind CSS está carregado no ambiente.
// Por exemplo, em um arquivo HTML, você pode ter:
// <script src="https://cdn.tailwindcss.com"></script>

function App() {
  const [donations, setDonations] = useState([]); // Armazena as doações únicas
  const [winner, setWinner] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [message, setMessage] = useState('');

  // Estados para a autenticação OAuth2
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Estados para o filtro de período
  const [startDate, setStartDate] = useState(''); // Formato 'YYYY-MM-DD'
  const [endDate, setEndDate] = useState('');   // Formato 'YYYY-MM-DD'

  // IMPORTANTE: URL do seu servidor proxy de backend.
  // Esta URL aponta para o seu backend implantado no Render.
  const PROXY_BASE_URL = 'https://livepix-proxy-api.onrender.com/api/livepix';

  // Função para simular a chegada de novas doações (mantida para testes sem API)
  const simulateNewDonations = useCallback(() => {
    const newDonors = [
      { name: 'Alice', amount: 10.00, message: 'Boa sorte a todos!', createdAt: '2025-05-20T10:00:00Z' },
      { name: 'Bob', amount: 25.50, message: 'Mandando uma força!', createdAt: '2025-05-22T11:30:00Z' },
      { name: 'Charlie', amount: 5.00, message: 'Pequena ajuda!', createdAt: '2025-05-25T12:00:00Z' },
      { name: 'Diana', amount: 50.00, message: 'Pra ajudar na live!', createdAt: '2025-05-28T13:45:00Z' },
      { name: 'Eduardo', amount: 15.00, message: 'Tamo junto!', createdAt: '2025-06-01T14:00:00Z' },
      { name: 'Fernanda', amount: 30.00, message: 'Adoro seu conteúdo!', createdAt: '2025-06-03T15:10:00Z' },
      { name: 'Gustavo', amount: 7.50, message: 'Valeu!', createdAt: '2025-06-05T16:00:00Z' },
      { name: 'Helena', amount: 20.00, message: 'Um abraço!', createdAt: '2025-06-08T17:20:00Z' },
      { name: 'Igor', amount: 12.00, message: 'Mandando um pix!', createdAt: '2025-06-10T18:00:00Z' },
      { name: 'Julia', amount: 40.00, message: 'Que a sorte esteja comigo!', createdAt: '2025-06-12T19:30:00Z' },
      { name: 'Karen', amount: 100.00, message: 'Sou fã!', createdAt: '2025-06-15T20:00:00Z' },
      { name: 'Luiz', amount: 20.00, message: 'Show de bola!', createdAt: '2025-06-18T21:00:00Z' },
      { name: 'Monica', amount: 5.00, message: 'Contribuição!', createdAt: '2025-06-20T22:00:00Z' },
      { name: 'Nuno', amount: 75.00, message: 'Arrasou!', createdAt: '2025-06-22T23:00:00Z' },
      { name: 'Olivia', amount: 18.00, message: 'Sempre apoiando!', createdAt: '2025-06-25T08:00:00Z' },
    ];

    const numNew = Math.floor(Math.random() * 3) + 1;
    const addedDonations = [];
    for (let i = 0; i < numNew; i++) {
      const randomDonor = newDonors[Math.floor(Math.random() * newDonors.length)];
      addedDonations.push({
        id: Date.now() + Math.random(),
        name: randomDonor.name,
        amount: randomDonor.amount,
        message: randomDonor.message,
        timestamp: new Date().toLocaleTimeString(),
      });
    }

    setDonations(prevDonations => [...prevDonations, ...addedDonations]);
    setMessage(`Simuladas ${addedDonations.length} novas doações!`);
  }, []);

  useEffect(() => {
    // Não simulamos doações iniciais ao carregar se o objetivo é usar a API real.
    // simulateNewDonations();
  }, [simulateNewDonations]);

  // Função para obter o Access Token REAL via seu servidor proxy
  const getAccessToken = async () => {
    if (!clientId || !clientSecret) {
      setMessage('Por favor, insira o ID do Cliente e o Segredo do Cliente.');
      return;
    }

    setIsAuthenticating(true);
    setMessage('Obtendo token de acesso via proxy...');
    try {
      // A requisição vai para o SEU servidor proxy, que então fala com o LivePix OAuth
      const response = await fetch(`${PROXY_BASE_URL}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Enviamos clientId e clientSecret para o nosso proxy no corpo da requisição.
        // O proxy os usará para obter o token do LivePix.
        body: JSON.stringify({ clientId, clientSecret }),
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
      setMessage(`Erro na autenticação: ${error.message}. Verifique suas credenciais e se o proxy está rodando.`);
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
    setMessage('Buscando doações reais da API via proxy...');
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
        amount: d.amount / 100, // A API retorna em centavos, então divida por 100
        message: d.message || 'Sem mensagem',
        timestamp: new Date(d.createdAt).toLocaleTimeString(),
        createdAt: d.createdAt // Mantém para o filtro, se necessário (filtro já no backend)
      }));

      setDonations(prevDonations => {
        // Filtra doações já existentes para evitar duplicatas (se tiver um ID único da API)
        const existingIds = new Set(prevDonations.map(d => d.id));
        const uniqueNewDonations = newDonationsFromApi.filter(d => !existingIds.has(d.id));
        return [...prevDonations, ...uniqueNewDonations];
      });
      setMessage(`Buscadas ${newDonationsFromApi.length} doações reais da API. Adicionadas ${uniqueNewDonations.length} novas.`);
    } catch (error) {
      console.error('Erro ao buscar doações da API via proxy:', error);
      setMessage(`Erro ao buscar doações: ${error.message}. Verifique o token e se o proxy está rodando.`);
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Função para realizar o sorteio com base nos números da sorte
  const drawWinner = () => {
    if (donations.length === 0) {
      setMessage('Não há doações para sortear!');
      setWinner(null);
      return;
    }

    setIsDrawing(true);
    setWinner(null);
    setMessage('Sorteando...');

    // Cria a lista de "bilhetes" para o sorteio, considerando R$10 = 1 número da sorte
    const drawTickets = [];
    donations.forEach(donation => {
      const numTickets = Math.floor(donation.amount / 10);
      for (let i = 0; i < numTickets; i++) {
        drawTickets.push(donation); // Adiciona o objeto da doação para cada "número da sorte"
      }
    });

    if (drawTickets.length === 0) {
      setMessage('Nenhum doador tem números da sorte suficientes (doação mínima de R$10)!');
      setIsDrawing(false);
      return;
    }

    // Simula um "giro" antes de revelar o vencedor
    let countdown = 3;
    const interval = setInterval(() => {
      setMessage(`Sorteando... ${countdown}...`);
      countdown--;
      if (countdown < 0) {
        clearInterval(interval);

        // Lógica de sorteio: seleciona um bilhete aleatoriamente
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
        <h1 className="text-5xl font-extrabold mb-2 drop-shadow-lg">Sorteio LivePix</h1>
        <p className="text-xl text-purple-200">Gerencie e sorteie doadores da sua live!</p>
        <p className="text-md text-purple-300 mt-2">Cada R$10 doados = 1 número da sorte!</p>
      </header>

      <main className="bg-white bg-opacity-10 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-4xl flex flex-col md:flex-row gap-8">
        {/* Seção de Doações */}
        <section className="flex-1 bg-white bg-opacity-5 rounded-2xl p-6 shadow-inner">
          <h2 className="text-3xl font-bold mb-4 text-purple-200">Doações Recebidas ({donations.length})</h2>

          {/* Campo para ID do Cliente */}
          <div className="mb-4">
            <label htmlFor="client-id" className="block text-purple-200 text-sm font-bold mb-2">
              ID do Cliente LivePix:
            </label>
            <input
              type="text"
              id="client-id"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="Seu ID de cliente aqui"
              className="shadow appearance-none border rounded-xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white bg-opacity-80"
            />
          </div>

          {/* Campo para Client Secret */}
          <div className="mb-4">
            <label htmlFor="client-secret" className="block text-purple-200 text-sm font-bold mb-2">
              Segredo do Cliente LivePix:
            </label>
            <input
              type="password" // Usar tipo password para esconder o segredo
              id="client-secret"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              placeholder="Seu segredo de cliente aqui"
              className="shadow appearance-none border rounded-xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white bg-opacity-80"
            />
            <button
              onClick={getAccessToken}
              disabled={isAuthenticating || !!accessToken} // Desabilita se já autenticando ou se já tem token
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
            <p className="text-sm text-purple-300 italic">
              O filtro será aplicado nas doações mais recentes que a API do LivePix retornar (até 100).
            </p>
          </div>

          {/* Botão para buscar doações da API (habilitado apenas com token) */}
          <div className="mb-4">
            <button
              onClick={fetchDonationsFromApi}
              disabled={isAuthenticating || !accessToken} // Requer token para buscar
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              {isAuthenticating ? 'Buscando Doações...' : 'Buscar Doações da API'}
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {donations.length === 0 ? (
              <p className="text-purple-300 italic">Nenhuma doação ainda. Obtenha o token e busque da API.</p>
            ) : (
              <ul className="space-y-3">
                {donations.map((donation) => (
                  <li key={donation.id} className="bg-purple-700 bg-opacity-70 rounded-xl p-4 flex flex-col shadow-md">
                    <div className="flex justify-between items-center mb-1">
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
          <button
            onClick={simulateNewDonations}
            className="mt-6 w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-300"
          >
            Simular Novas Doações Aleatórias (Apenas para Teste)
          </button>
        </section>

        {/* Seção de Sorteio */}
        <section className="flex-1 bg-white bg-opacity-5 rounded-2xl p-6 shadow-inner flex flex-col justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-4 text-purple-200">Realizar Sorteio</h2>
            <p className="text-purple-300 mb-6">
              Clique no botão abaixo para sortear um doador. As chances são baseadas no valor da doação (R$10 = 1 número da sorte).
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

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(192, 132, 252, 1); /* purple-300 */
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
