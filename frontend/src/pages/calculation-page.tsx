import axios from 'axios'
import { Navbar } from "../components/Navbar";
import { useEffect, useState } from 'react'
import './styles/calcpage.css'
import editIcon from './styles/edit.png'
import checkIcon from './styles/check.png'

// Adicionando interfaces para tipagem
interface Eletrodomestico {
  nome: string;
  potenciaWatts: number;
  tempoUsoHorasPorDia: number;
}

interface Comodo {
  nome: string;
  eletrodomesticos: Eletrodomestico[];
  totalKwh: number;
}

interface Ambiente {
  nome: string;
  comodos: Comodo[];
  totalKwh: number;
}

export function CalculationPage() {
  const [flag, setFlag] = useState('');
  const [description, setDescription] = useState('');
  const [cep, setCep] = useState('');
  const [editable, setEditable] = useState(false);
  const [cepStatus, setCepStatus] = useState<'success' | 'error' | ''>(''); 
  const [userId, setUserId] = useState<string>('');
  const [ambientes, setAmbientes] = useState<Ambiente[]>([]);
  const [totalConsumo, setTotalConsumo] = useState(0);
  const [custoEstimado, setCustoEstimado] = useState(0);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('http://localhost:5000/api/userProfile', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userCep = response.data?.cep;
      if (userCep) {
        setCep(userCep);
        setEditable(false);
        setCepStatus('success');
      } else {
        setEditable(true);
      }

      // Processar ambientes e consumo
      if (response.data.ambientes) {
        const ambientesData: Ambiente[] = response.data.ambientes.map((ambiente: any) => {
          const comodos: Comodo[] = ambiente.comodos.map((comodo: any) => {
            const consumoComodo = comodo.eletrodomesticos.reduce((total: number, eletro: any) => {
              return total + (eletro.potenciaWatts / 1000) * eletro.tempoUsoHorasPorDia * 30;
            }, 0);
            
            return {
              ...comodo,
              totalKwh: parseFloat(consumoComodo.toFixed(2))
            };
          });

          const consumoAmbiente = comodos.reduce((total: number, comodo: Comodo) => total + comodo.totalKwh, 0);
          
          return {
            ...ambiente,
            comodos,
            totalKwh: parseFloat(consumoAmbiente.toFixed(2))
          };
        });

        setAmbientes(ambientesData);
        const total = ambientesData.reduce((acc: number, a: Ambiente) => acc + a.totalKwh, 0);
        setTotalConsumo(total);
        
        // Calcular custo estimado se a flag já estiver sido definida
        if (flag) {
          calculateEstimatedCost(total, flag, description);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  };

  const calculateEstimatedCost = (consumo: number, currentFlag: string, flagDesc: string) => {
    const tarifaBase = 0.8; // R$/kWh
    const adicional = parseFloat(flagDesc.replace(",", ".")) / 100; // Converte para R$/kWh
    setCustoEstimado(consumo * (tarifaBase + adicional));
  };

  const checkTariffFlag = async () => {
    try {
      const response = await axios.get(
        'https://corsproxy.io/?https://dadosabertos.aneel.gov.br/api/3/action/datastore_search?resource_id=0591b8f6-fe54-437b-b72b-1aa2efd46e42&limit=1'
      );
      const record = response.data.result.records[0];
      const currentFlag = record.NomBandeiraAcionada.toLowerCase();
      const flagDescription = record.VlrAdicionalBandeira;
      
      setFlag(currentFlag);
      setDescription(flagDescription);
      
      // Calcular custo estimado se o totalConsumo já estiver disponível
      if (totalConsumo > 0) {
        calculateEstimatedCost(totalConsumo, currentFlag, flagDescription);
      }
    } catch (error) {
      console.log(error);
      alert("Erro ao verificar a tarifa!");
    }
  };

  const cepValidation = async (formattedCep: string) => {
    if (formattedCep.length !== 8 || !/^\d+$/.test(formattedCep)) {
      setCepStatus('error');
      return;
    }

    try {
      await axios.get(`https://viacep.com.br/ws/${formattedCep}/json/`);
      setCepStatus('success');
      
      if (userId) {
        await updateUserCep(userId, formattedCep);
      }
    } catch (error) {
      setCepStatus('error');
    }
  };

  const updateUserCep = async (userId: string, cep: string) => {
    try {
      await axios.put('http://localhost:5000/api/updateCEP', 
        { userId, cep },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
    } catch (error) {
      console.log('Erro ao atualizar CEP:', error);
    }
  };

  const handleConfirmCep = () => {
    const formattedCep = cep.replace(/\D/g, '');
    setEditable(false);
    formattedCep ? cepValidation(formattedCep) : setCepStatus('error');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleConfirmCep();
  };

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) setUserId(storedUserId);

    fetchUserData();
    checkTariffFlag();
  }, []);

  // Atualizar o custo estimado quando o totalConsumo ou a flag mudar
  useEffect(() => {
    if (totalConsumo > 0 && flag && description) {
      calculateEstimatedCost(totalConsumo, flag, description);
    }
  }, [totalConsumo, flag, description]);

  const flagLevels: { [key: string]: number } = {
    verde: 0,
    amarela: 1,
    vermelha: 2,
    'vermelha p1': 2,
    'vermelha p2': 3,
    'vermelha patamar 1': 2,
    'vermelha patamar 2': 3,
  };

  const level = flagLevels[flag] ?? -1;

  return (
    <>
    <Navbar />
    <div id="calcPage-container">
      <div className="calcPage-cep-section">
        <h2>Cálculo de Consumo</h2>
        <label>Digite seu CEP</label>
        <div className="calcPage-cep-editable">
          <label>CEP:</label>
          <input
            type="text"
            value={cep}
            onChange={(e) => setCep(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={!editable}
            placeholder="Digite seu CEP"
          />
          {editable ? (
            <img
              src={checkIcon}
              alt="Confirmar"
              onClick={handleConfirmCep}
              style={{ cursor: 'pointer', marginLeft: '10px' }}
            />
          ) : (
            <img
              src={editIcon}
              alt="Editar"
              onClick={() => setEditable(true)}
              style={{ cursor: 'pointer', marginLeft: '10px' }}
            />
          )}
        </div>
        {cepStatus === 'success' && (
          <p className="calcPage-cep-feedback success">Seu consumo está sendo calculado para sua região!</p>
        )}
        {cepStatus === 'error' && (
          <p className="calcPage-cep-feedback error">Insira um CEP correto para um cálculo mais preciso!</p>
        )}
      </div>

      <div className="calcPage-result-eletros">
        <div className="calcPage-scroll-container">
          {ambientes.map((ambiente, index) => (
            <div key={index} className="calcPage-ambiente-container">
              <h4>{ambiente.nome} - {ambiente.totalKwh} kWh/mês</h4>
              <div className="calcPage-comodos-container">
                {ambiente.comodos.map((comodo: any, cIndex: number) => (
                  <div key={cIndex} className="calcPage-comodo-item">
                    <p>{comodo.nome}: {comodo.totalKwh} kWh/mês</p>
                    <ul className="calcPage-eletrodomesticos-list">
                      {comodo.eletrodomesticos.map((eletro: any, eIndex: number) => (
                        <li key={eIndex}>
                          {eletro.nome} - {(eletro.potenciaWatts / 1000 * eletro.tempoUsoHorasPorDia * 30).toFixed(2)} kWh/mês
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="calcPage-consumo-total">
          <p>Consumo Total: <strong>{totalConsumo.toFixed(2)} kWh/mês</strong></p>
        </div>
      </div>

      {flag && (
        <div className="calcPage-tariff-result">
          <h3>
            Bandeira Atual:{" "}
            <span className={`calcPage-flag-name ${flag.replace(/\s+/g, '-')}`}>
              {flag}
            </span>
          </h3>

          <div className="calcPage-flag-bar-container">
            <div className="calcPage-flag-bar-background">
              {level >= 0 && (
                <div
                  className="calcPage-flag-indicator"
                  style={{ left: `calc(${(level + 0.5) * 25}% - 7px)` }}
                />
              )}
            </div>
            <div className="calcPage-flag-bar-labels">
              <span>Verde</span>
              <span>Amarela</span>
              <span>Vermelha (P1)</span>
              <span>Vermelha (P2)</span>
            </div>
            <p>Um adicional de R${description} a cada 100 kWh</p>
          </div>

          <div className="calcPage-custo-estimado">
            <h3>Custo Estimado</h3>
            <p><strong>R$ {custoEstimado.toFixed(2)}/mês</strong></p>
            <small>(Tarifa base: R$ 0,80/kWh + bandeira {flag})</small>
          </div>
        </div>
      )}
    </div>
    </>
  );
}