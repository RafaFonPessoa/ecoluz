import axios from 'axios'
import { useState } from 'react'
import './styles/tariffflagchecker.css' 

export function TariffFlagChecker() {
  const [flag, setFlag] = useState('');
  const [description, setDescription] = useState('');

  const checkTariffFlag = async () => {
    try {
      const response = await axios.get('https://corsproxy.io/?https://dadosabertos.aneel.gov.br/api/3/action/datastore_search?resource_id=0591b8f6-fe54-437b-b72b-1aa2efd46e42&limit=1');  
      
      const record = response.data.result.records[0]; // <- aqui é o jeito certo
      const currentFlag = record.NomBandeiraAcionada;
      const flagDescription = record.VlrAdicionalBandeira;

      setFlag(currentFlag);
      setDescription(flagDescription);
    } catch (error) {
      console.log(error);
      alert("Erro ao verificar a tarifa!");
    }
  }
  
  return( 
    <>
      <div id="container-tariff-flag-checker">
        <h2>Verificar Bandeira Tarifária</h2>
        <p>Verifique a tarifa nacional de energia!</p>
        
        <button onClick={checkTariffFlag}>Verificar</button>
      
        {flag && (
          <div className="tariff-result">
            <h2>Bandeira Atual: {flag}</h2>
            <p>Um adicional de R${description} a cada 100 kWh</p>
          </div>
        )}
      </div>
    </>
  )
}

