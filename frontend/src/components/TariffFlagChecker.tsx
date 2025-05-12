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

  const cepValidation = async () => {
    const formatedCep = cep.replace(/\D/g, '');

    const onlyNumberValue = /^[0-9]+$/.test(formatedCep);

    if (!onlyNumberValue || formatedCep.length !== 8) {
      setCepStatus('error');
      return;
    }

    try {
      const response = await axios.get(`https://viacep.com.br/ws/${formatedCep}/json/`);
      console.log(response.data);
      setCepStatus('success');
    } catch (error) {
      console.log(error);
      setCepStatus('error');
      alert("Erro ao Buscar CEP! Tente Novamente");
    }
  };

  const handleConfirmCep = () => {
    setEditable(false);
    cepValidation();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleConfirmCep();
    }
  };

  useEffect(() => {
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
