import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/electrodomesticliststyle.css';
import deleteIcon from './styles/delete.png';

type Eletrodomestico = {
  _id?: string;
  nome: string;
  potenciaWatts: number;
  tempoUsoHorasPorDia: number;
  consumoKwh?: number;
  tempoUsoHoras?: number;
};

type Comodo = {
  _id?: string;
  nome: string;
  aberto: boolean;
  eletrodomesticos: Eletrodomestico[];
  totalKwh: number;
};

type Ambiente = {
  _id?: string;
  nome: string;
  aberto: boolean;
  comodos: Comodo[];
  totalKwh: number;
};

export function ElectrodomesticList() {
  const [ambientes, setAmbientes] = useState<Ambiente[]>([]);
  const [mostrarModalAmbiente, setMostrarModalAmbiente] = useState(false);
  const [mostrarModalComodo, setMostrarModalComodo] = useState<{ aberto: boolean; ambienteIndex: number | null }>({ aberto: false, ambienteIndex: null });
  const [mostrarModalEletro, setMostrarModalEletro] = useState<{ aberto: boolean; ambienteIndex: number | null; comodoIndex: number | null }>({ aberto: false, ambienteIndex: null, comodoIndex: null });

  // Estados para inputs
  const [nomeAmbiente, setNomeAmbiente] = useState('');
  const [nomeComodo, setNomeComodo] = useState('');
  const [nomeEletro, setNomeEletro] = useState('');
  const [potenciaEletro, setPotenciaEletro] = useState('');
  const [tempoUsoEletro, setTempoUsoEletro] = useState('');

  // Carrega os dados do usuário ao iniciar
  useEffect(() => {
    const carregarAmbientes = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');

        if (!token || !userId) {
          console.error('Usuário não autenticado');
          return;
        }

        const response = await axios.get('http://localhost:5000/api/userProfile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.ambientes) {
          setAmbientes(response.data.ambientes.map((ambiente: any) => ({
            ...ambiente,
            aberto: false,
            comodos: ambiente.comodos.map((comodo: any) => ({
              ...comodo,
              aberto: false,
              eletrodomesticos: comodo.eletrodomesticos.map((eletro: any) => ({
                ...eletro,
                consumoKwh: eletro.potenciaWatts / 1000, // Convertendo W para kW
                tempoUsoHoras: eletro.tempoUsoHorasPorDia
              })),
              totalKwh: comodo.eletrodomesticos.reduce(
                (acc: number, e: any) => acc + (e.potenciaWatts / 1000) * e.tempoUsoHorasPorDia,
                0
              )
            })),
            totalKwh: ambiente.comodos.reduce(
              (acc: number, c: any) => acc + c.eletrodomesticos.reduce(
                (acc2: number, e: any) => acc2 + (e.potenciaWatts / 1000) * e.tempoUsoHorasPorDia,
                0
              ),
              0
            )
          })));
        }
      } catch (error) {
        console.error('Erro ao carregar ambientes:', error);
      }
    };

    carregarAmbientes();
  }, []);

  // Adiciona novo ambiente
  const adicionarAmbiente = async () => {
    if (nomeAmbiente.trim() === '') return;

    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      if (!token || !userId) {
        alert('Usuário não autenticado');
        return;
      }

      const response = await axios.post(
        'http://localhost:5000/api/usuario/ambientes',
        { userId, nome: nomeAmbiente },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const novoAmbiente: Ambiente = {
        _id: response.data.ambiente._id,
        nome: response.data.ambiente.nome,
        aberto: false,
        comodos: [],
        totalKwh: 0,
      };

      setAmbientes([...ambientes, novoAmbiente]);
      setNomeAmbiente('');
      setMostrarModalAmbiente(false);
    } catch (error) {
      console.error('Erro ao adicionar ambiente:', error);
      alert('Erro ao adicionar ambiente. Tente novamente.');
    }
  };

  // Alterna expandir/colapsar ambiente
  const alternarAmbiente = (index: number) => {
    const copia = [...ambientes];
    copia[index].aberto = !copia[index].aberto;
    setAmbientes(copia);
  };

  // Alterna expandir/colapsar cômodo
  const alternarComodo = (ambIndex: number, comIndex: number) => {
    const copia = [...ambientes];
    copia[ambIndex].comodos[comIndex].aberto = !copia[ambIndex].comodos[comIndex].aberto;
    setAmbientes(copia);
  };

  // Abre modal para adicionar cômodo em um ambiente
  const abrirModalComodo = (ambienteIndex: number) => {
    setMostrarModalComodo({ aberto: true, ambienteIndex });
    setNomeComodo('');
  };

  // Adiciona cômodo dentro do ambiente selecionado
  const adicionarComodo = async () => {
    if (nomeComodo.trim() === '' || mostrarModalComodo.ambienteIndex === null) return;

    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      const ambienteId = ambientes[mostrarModalComodo.ambienteIndex]._id;

      if (!token || !userId || !ambienteId) {
        alert('Dados inválidos para adicionar cômodo');
        return;
      }

      const response = await axios.post(
        `http://localhost:5000/api/usuario/ambientes/${ambienteId}/comodos`,
        { userId, nome: nomeComodo },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const copia = [...ambientes];
      copia[mostrarModalComodo.ambienteIndex].comodos.push({
        _id: response.data.comodo._id,
        nome: response.data.comodo.nome,
        aberto: false,
        eletrodomesticos: [],
        totalKwh: 0,
      });
      setAmbientes(copia);
      setMostrarModalComodo({ aberto: false, ambienteIndex: null });
    } catch (error) {
      console.error('Erro ao adicionar cômodo:', error);
      alert('Erro ao adicionar cômodo. Tente novamente.');
    }
  };

  // Abre modal para adicionar eletrodoméstico em cômodo
  const abrirModalEletro = (ambienteIndex: number, comodoIndex: number) => {
    setMostrarModalEletro({ aberto: true, ambienteIndex, comodoIndex });
    setNomeEletro('');
    setPotenciaEletro('');
    setTempoUsoEletro('');
  };

  // Adiciona eletrodoméstico no cômodo selecionado
  const adicionarEletrodomestico = async () => {
    if (
      nomeEletro.trim() === '' ||
      potenciaEletro.trim() === '' ||
      tempoUsoEletro.trim() === '' ||
      mostrarModalEletro.ambienteIndex === null ||
      mostrarModalEletro.comodoIndex === null
    ) {
      return;
    }

    const potencia = parseFloat(potenciaEletro);
    const tempo = parseFloat(tempoUsoEletro);

    if (isNaN(potencia) || isNaN(tempo)) return;

    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      const ambienteId = ambientes[mostrarModalEletro.ambienteIndex]._id;
      const comodoId = ambientes[mostrarModalEletro.ambienteIndex].comodos[mostrarModalEletro.comodoIndex]._id;

      if (!token || !userId || !ambienteId || !comodoId) {
        alert('Dados inválidos para adicionar eletrodoméstico');
        return;
      }

      const response = await axios.post(
        `http://localhost:5000/api/usuario/ambientes/${ambienteId}/comodos/${comodoId}/eletrodomesticos`,
        {
          userId,
          nome: nomeEletro,
          potenciaWatts: potencia,
          tempoUsoHorasPorDia: tempo,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const copia = [...ambientes];
      const eletro: Eletrodomestico = {
        _id: response.data.eletrodomestico._id,
        nome: response.data.eletrodomestico.nome,
        potenciaWatts: response.data.eletrodomestico.potenciaWatts,
        tempoUsoHorasPorDia: response.data.eletrodomestico.tempoUsoHorasPorDia,
        consumoKwh: response.data.eletrodomestico.potenciaWatts / 1000,
        tempoUsoHoras: response.data.eletrodomestico.tempoUsoHorasPorDia,
      };

      copia[mostrarModalEletro.ambienteIndex].comodos[mostrarModalEletro.comodoIndex].eletrodomesticos.push(eletro);

      // Atualiza totalKwh do cômodo e do ambiente
      const totalComodo = copia[mostrarModalEletro.ambienteIndex].comodos[mostrarModalEletro.comodoIndex].eletrodomesticos.reduce(
        (acc, e) => acc + (e.potenciaWatts / 1000) * e.tempoUsoHorasPorDia,
        0
      );
      copia[mostrarModalEletro.ambienteIndex].comodos[mostrarModalEletro.comodoIndex].totalKwh = parseFloat(totalComodo.toFixed(2));

      const totalAmbiente = copia[mostrarModalEletro.ambienteIndex].comodos.reduce(
        (acc, c) => acc + c.totalKwh,
        0
      );
      copia[mostrarModalEletro.ambienteIndex].totalKwh = parseFloat(totalAmbiente.toFixed(2));

      setAmbientes(copia);
      setMostrarModalEletro({ aberto: false, ambienteIndex: null, comodoIndex: null });
    } catch (error) {
      console.error('Erro ao adicionar eletrodoméstico:', error);
      alert('Erro ao adicionar eletrodoméstico. Tente novamente.');
    }
  };

  // Remove eletrodoméstico
  const removerEletrodomestico = async (ambIndex: number, comIndex: number, eletroIndex: number) => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      const ambienteId = ambientes[ambIndex]._id;
      const comodoId = ambientes[ambIndex].comodos[comIndex]._id;
      const eletroId = ambientes[ambIndex].comodos[comIndex].eletrodomesticos[eletroIndex]._id;

      if (!token || !userId || !ambienteId || !comodoId || !eletroId) {
        alert('Dados inválidos para remover eletrodoméstico');
        return;
      }

      await axios.delete(
        `http://localhost:5000/api/usuario/ambientes/${ambienteId}/comodos/${comodoId}/eletrodomesticos/${eletroId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const copia = [...ambientes];
      copia[ambIndex].comodos[comIndex].eletrodomesticos.splice(eletroIndex, 1);

      // Atualiza totalKwh do cômodo
      const totalComodo = copia[ambIndex].comodos[comIndex].eletrodomesticos.reduce(
        (acc, e) => acc + (e.potenciaWatts / 1000) * e.tempoUsoHorasPorDia,
        0
      );
      copia[ambIndex].comodos[comIndex].totalKwh = parseFloat(totalComodo.toFixed(2));

      // Atualiza total do ambiente
      const totalAmbiente = copia[ambIndex].comodos.reduce(
        (acc, c) => acc + c.totalKwh,
        0
      );
      copia[ambIndex].totalKwh = parseFloat(totalAmbiente.toFixed(2));

      setAmbientes(copia);
    } catch (error) {
      console.error('Erro ao remover eletrodoméstico:', error);
      alert('Erro ao remover eletrodoméstico. Tente novamente.');
    }
  };

  return (
    <div id="container-electrodomestic">
      <h2>Lista de Eletrodomésticos por Ambiente e Cômodo</h2>

      <div id="scroll-ambientes">
        <div className="ambientes-wrapper">
          {ambientes.map((ambiente, ambIndex) => (
            <div className="ambiente" key={ambIndex}>
              <div className="ambiente-bar" onClick={() => alternarAmbiente(ambIndex)}>
                <strong>{ambiente.nome}</strong>
                <span>{ambiente.totalKwh.toFixed(2)} kWh</span>
                <span>{ambiente.aberto ? '▲' : '▼'}</span>
              </div>

              {ambiente.aberto && (
                <div className="ambiente-conteudo">
                  <button onClick={() => abrirModalComodo(ambIndex)} style={{ marginBottom: '10px' }}>
                    + Adicionar Cômodo
                  </button>

                  {ambiente.comodos.length > 0 ? (
                    ambiente.comodos.map((comodo, comIndex) => (
                      <div key={comIndex} className="comodo-container" style={{ marginBottom: '10px', border: '1px solid #ccc', padding: '5px' }}>
                        <div
                          className="comodo-bar"
                          style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
                          onClick={() => alternarComodo(ambIndex, comIndex)}
                        >
                          <strong>{comodo.nome}</strong>
                          <span>{comodo.totalKwh.toFixed(2)} kWh</span>
                          <span>{comodo.aberto ? '▲' : '▼'}</span>
                        </div>

                        {comodo.aberto && (
                          <div className="comodo-conteudo" style={{ marginLeft: '10px', marginTop: '5px' }}>
                            {comodo.eletrodomesticos.length > 0 ? (
                              <ul>
                                {comodo.eletrodomesticos.map((eletro, eletroIndex) => (
                                  <li className="eletrodomestico-item" key={eletroIndex}>
                                    {eletro.nome} - {eletro.potenciaWatts}W - {eletro.tempoUsoHorasPorDia}h/dia
                                    <img
                                      src={deleteIcon}
                                      alt="Remover"
                                      className="remover-eletrodomestico-img"
                                      onClick={() => removerEletrodomestico(ambIndex, comIndex, eletroIndex)}
                                    />
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p>Nenhum eletrodoméstico ainda.</p>
                            )}

                            <button onClick={() => abrirModalEletro(ambIndex, comIndex)}>+ Adicionar Eletrodoméstico</button>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p>Nenhum cômodo ainda.</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="botao-centralizado">
        <button onClick={() => setMostrarModalAmbiente(true)}>Adicionar Ambiente</button>
      </div>

      {/* Modal adicionar ambiente */}
      {mostrarModalAmbiente && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Nome do novo ambiente</h3>
            <input
              type="text"
              placeholder="Digite o nome"
              value={nomeAmbiente}
              onChange={(e) => setNomeAmbiente(e.target.value)}
            />
            <div className="modal-buttons">
              <button onClick={adicionarAmbiente}>Adicionar</button>
              <button onClick={() => setMostrarModalAmbiente(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal adicionar cômodo */}
      {mostrarModalComodo.aberto && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Nome do novo cômodo</h3>
            <input
              type="text"
              placeholder="Digite o nome"
              value={nomeComodo}
              onChange={(e) => setNomeComodo(e.target.value)}
            />
            <div className="modal-buttons">
              <button onClick={adicionarComodo}>Adicionar</button>
              <button onClick={() => setMostrarModalComodo({ aberto: false, ambienteIndex: null })}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal adicionar eletrodoméstico */}
      {mostrarModalEletro.aberto && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Adicionar Eletrodoméstico</h3>
            <input
              type="text"
              placeholder="Nome"
              value={nomeEletro}
              onChange={(e) => setNomeEletro(e.target.value)}
            />
            <input
              type="number"
              placeholder="Potência em Watts"
              value={potenciaEletro}
              onChange={(e) => setPotenciaEletro(e.target.value)}
            />
            <input
              type="number"
              placeholder="Tempo de uso diário (horas)"
              value={tempoUsoEletro}
              onChange={(e) => setTempoUsoEletro(e.target.value)}
            />
            <div className="modal-buttons">
              <button onClick={adicionarEletrodomestico}>Adicionar</button>
              <button onClick={() => setMostrarModalEletro({ aberto: false, ambienteIndex: null, comodoIndex: null })}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}