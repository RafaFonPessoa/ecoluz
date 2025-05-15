import axios from 'axios'
import { useEffect, useState } from 'react'
import './styles/tariffflagchecker.css'
import editIcon from './styles/edit.png'
import checkIcon from './styles/check.png'

export function TariffFlagChecker() {
  const [flag, setFlag] = useState('');
  const [description, setDescription] = useState('');
  const [cep, setCep] = useState('');
  const [editable, setEditable] = useState(false);
  const [cepStatus, setCepStatus] = useState<'success' | 'error' | ''>(''); 
  const [userId, setUserId] = useState<string>('');

  // ✅ Função para buscar o CEP do backend
  const fetchUserCep = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('http://localhost:5000/api/userProfile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const userCep = response.data?.cep;
      if (userCep) {
        setCep(userCep);
        setEditable(false); // campo não editável se já tiver cep
        setCepStatus('success');
      } else {
        setEditable(true); // permite edição se ainda não tem cep
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
    }
  };

  const checkTariffFlag = async () => {
    try {
      const response = await axios.get('https://corsproxy.io/?https://dadosabertos.aneel.gov.br/api/3/action/datastore_search?resource_id=0591b8f6-fe54-437b-b72b-1aa2efd46e42&limit=1');
      const record = response.data.result.records[0];
      const currentFlag = record.NomBandeiraAcionada.toLowerCase();
      const flagDescription = record.VlrAdicionalBandeira;
      setFlag(currentFlag);
      setDescription(flagDescription);
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
      const response = await axios.get(`https://viacep.com.br/ws/${formattedCep}/json/`);
      console.log(response.data);
      setCepStatus('success');
      
      if (userId) {
        await updateUserCep(userId, formattedCep);
      } else {
        alert('Usuário não autenticado');
      }
    } catch (error) {
      console.log(error);
      setCepStatus('error');
      alert("Erro ao Buscar CEP! Tente Novamente");
    }
  };

  const updateUserCep = async (userId: string, formattedCep: string) => {
    try {
      const response = await axios.put('http://localhost:5000/api/updateCEP', { userId, cep: formattedCep },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          }
        }
      );
      if (response.status === 200) {
        alert('CEP atualizado com sucesso!');
      }
    } catch (error) {
      console.log('Erro ao atualizar CEP:', error);
      alert('Erro ao atualizar CEP.');
    }
  };

  const handleConfirmCep = () => {
    const formattedCep = cep.replace(/\D/g, '');
    setEditable(false);
    if (formattedCep) {
      cepValidation(formattedCep);
    } else {
      setCepStatus('error');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleConfirmCep();
    }
  };

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    }

    fetchUserCep(); // ✅ chama a função para carregar o CEP salvo
    checkTariffFlag();
  }, []);

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
    <div id="container-tariff-flag-checker">
      <div className="cep-section">
        <h2>Cálculo Tarifário</h2>
        <label>Digite seu CEP</label>
        <div className="cep-editable">
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
          <p className="cep-feedback success">Sua tarifa está sendo calculada baseada onde você mora!</p>
        )}
        {cepStatus === 'error' && (
          <p className="cep-feedback error">Insira um CEP correto para o cálculo da sua tarifa ser mais preciso!</p>
        )}
      </div>

      {flag && (
        <div className="tariff-result">
          <h3>
            Bandeira Atual:{" "}
            <span className={`flag-name ${flag.replace(/\s+/g, '-')}`}>
              {flag}
            </span>
          </h3>

          <div className="flag-bar-container">
            <div className="flag-bar-background">
              {level >= 0 && (
                <div
                  className="flag-indicator"
                  style={{ left: `calc(${(level + 0.5) * 25}% - 7px)` }}
                />
              )}
            </div>
            <div className="flag-bar-labels">
              <span>Verde</span>
              <span>Amarela</span>
              <span>Vermelha (P1)</span>
              <span>Vermelha (P2)</span>
            </div>
            <p>Um adicional de R${description} a cada 100 kWh</p>
          </div>
        </div>
      )}
    </div>
  );
}
