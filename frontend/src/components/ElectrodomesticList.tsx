import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/electrodomesticliststyle.css';
import deleteIcon from './styles/delete.png';
import editIcon from './styles/edit.png';

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
  const [mostrarModalEditarAmbiente, setMostrarModalEditarAmbiente] = useState<{ aberto: boolean; ambienteIndex: number | null; novoNome: string }>({ aberto: false, ambienteIndex: null, novoNome: '' });
  const [mostrarModalEditarComodo, setMostrarModalEditarComodo] = useState<{ aberto: boolean; ambienteIndex: number | null; comodoIndex: number | null; novoNome: string }>({ aberto: false, ambienteIndex: null, comodoIndex: null, novoNome: '' });
  const [mostrarModalBuscaEletro, setMostrarModalBuscaEletro] = useState<{ aberto: boolean; ambienteIndex: number | null; comodoIndex: number | null }>({ aberto: false, ambienteIndex: null, comodoIndex: null });
  const [mostrarModalManualEletro, setMostrarModalManualEletro] = useState<{ aberto: boolean; ambienteIndex: number | null; comodoIndex: number | null; nomeEletro: string }>({ aberto: false, ambienteIndex: null, comodoIndex: null, nomeEletro: '' });
  const [buscaEletro, setBuscaEletro] = useState('');
  const [resultadoBusca, setResultadoBusca] = useState<{ encontrado: boolean; kwh?: number; potenciaWatts?: number } | null>(null);
  const [carregandoBusca, setCarregandoBusca] = useState(false);

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
                consumoKwh: eletro.potenciaWatts / 1000,
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

  const removerAmbiente = async (ambienteIndex: number) => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      const ambienteId = ambientes[ambienteIndex]._id;

      if (!token || !userId || !ambienteId) {
        alert('Dados inválidos para remover ambiente');
        return;
      }

      await axios.delete(
        `http://localhost:5000/api/usuario/ambientes/${ambienteId}?userId=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const copia = [...ambientes];
      copia.splice(ambienteIndex, 1);
      setAmbientes(copia);
    } catch (error) {
      console.error('Erro ao remover ambiente:', error);
      alert('Erro ao remover ambiente. Tente novamente.');
    }
  }

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

  // Abre modal para buscar eletrodoméstico
  const abrirModalBuscaEletro = (ambienteIndex: number, comodoIndex: number) => {
    setMostrarModalBuscaEletro({ aberto: true, ambienteIndex, comodoIndex });
    setMostrarModalEletro({ aberto: false, ambienteIndex: null, comodoIndex: null });
    setBuscaEletro('');
    setResultadoBusca(null);
    setNomeEletro('');
    setPotenciaEletro('');
    setTempoUsoEletro('');
  };

  // Busca consumo do eletrodoméstico
  const buscarConsumoEletro = async () => {
    if (buscaEletro.trim() === '') return;
    
    setCarregandoBusca(true);
    try {
      const response = await axios.post('http://localhost:5000/api/buscar-consumo', {
        eletrodomestico: buscaEletro
      });

      if (response.data.encontrado) {
        // Converter kWh/mês para Watts (considerando uso de 30 dias, 24 horas/dia)
        const horasNoMes = 30 * 24; // 720 horas
        const potenciaWatts = (response.data.kwh * 1000) / horasNoMes;
        
        setResultadoBusca({
          encontrado: true,
          kwh: response.data.kwh,
          potenciaWatts: parseFloat(potenciaWatts.toFixed(2))
        });
        
        // Preenche automaticamente os campos no modal manual
        setNomeEletro(buscaEletro);
        setPotenciaEletro(potenciaWatts.toFixed(2));
      } else {
        setResultadoBusca({
          encontrado: false
        });
        setNomeEletro(buscaEletro);
        setPotenciaEletro('');
      }
    } catch (error) {
      console.error('Erro ao buscar consumo:', error);
      setResultadoBusca({
        encontrado: false
      });
      setNomeEletro(buscaEletro);
      setPotenciaEletro('');
    } finally {
      setCarregandoBusca(false);
    }
  };

  // Abre modal para inserção manual de eletrodoméstico
  const abrirModalManualEletro = () => {
    if (mostrarModalBuscaEletro.ambienteIndex === null || mostrarModalBuscaEletro.comodoIndex === null) return;
    
    setMostrarModalManualEletro({
      aberto: true,
      ambienteIndex: mostrarModalBuscaEletro.ambienteIndex,
      comodoIndex: mostrarModalBuscaEletro.comodoIndex,
      nomeEletro: buscaEletro
    });
    setMostrarModalBuscaEletro({ aberto: false, ambienteIndex: null, comodoIndex: null });
  };

  // Remove cômodo
  const removerComodo = async (ambIndex: number, comIndex: number) => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      const ambienteId = ambientes[ambIndex]._id;
      const comodoId = ambientes[ambIndex].comodos[comIndex]._id;

      if (!token || !userId || !ambienteId || !comodoId) {
        alert('Dados inválidos para remover cômodo');
        return;
      }

      await axios.delete(
        `http://localhost:5000/api/usuario/ambientes/${ambienteId}/comodos/${comodoId}?userId=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const copia = [...ambientes];
      copia[ambIndex].comodos.splice(comIndex, 1);

      // Atualiza total do ambiente
      const totalAmbiente = copia[ambIndex].comodos.reduce(
        (acc, c) => acc + c.totalKwh,
        0
      );
      copia[ambIndex].totalKwh = parseFloat(totalAmbiente.toFixed(2));

      setAmbientes(copia);
    } catch (error) {
      console.error('Erro ao remover cômodo:', error);
      alert('Erro ao remover cômodo. Tente novamente.');
    }
  };

  // Adiciona eletrodoméstico no cômodo selecionado
  const adicionarEletrodomestico = async () => {
    if (
      nomeEletro.trim() === '' ||
      potenciaEletro.trim() === '' ||
      tempoUsoEletro.trim() === '' ||
      mostrarModalManualEletro.ambienteIndex === null ||
      mostrarModalManualEletro.comodoIndex === null
    ) {
      return;
    }

    const potencia = parseFloat(potenciaEletro);
    const tempo = parseFloat(tempoUsoEletro);

    if (isNaN(potencia) || isNaN(tempo)) return;

    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      const ambiente = ambientes[mostrarModalManualEletro.ambienteIndex];
      const comodo = ambiente.comodos[mostrarModalManualEletro.comodoIndex];
      const ambienteId = ambiente._id;
      const comodoId = comodo._id;

      if (!token || !userId || !ambiente?._id || !comodo?._id) {
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
        _id: response.data.eletrodomestico._id || Date.now().toString(),
        nome: response.data.eletrodomestico.nome,
        potenciaWatts: response.data.eletrodomestico.potenciaWatts,
        tempoUsoHorasPorDia: response.data.eletrodomestico.tempoUsoHorasPorDia,
        consumoKwh: response.data.eletrodomestico.potenciaWatts / 1000,
        tempoUsoHoras: response.data.eletrodomestico.tempoUsoHorasPorDia,
      };

      copia[mostrarModalManualEletro.ambienteIndex].comodos[mostrarModalManualEletro.comodoIndex].eletrodomesticos.push(eletro);

      // Atualiza totais
      const totalComodo = copia[mostrarModalManualEletro.ambienteIndex].comodos[mostrarModalManualEletro.comodoIndex].eletrodomesticos.reduce(
        (acc, e) => acc + (e.potenciaWatts / 1000) * e.tempoUsoHorasPorDia,
        0
      );
      copia[mostrarModalManualEletro.ambienteIndex].comodos[mostrarModalManualEletro.comodoIndex].totalKwh = parseFloat(totalComodo.toFixed(2));

      const totalAmbiente = copia[mostrarModalManualEletro.ambienteIndex].comodos.reduce(
        (acc, c) => acc + c.totalKwh,
        0
      );
      copia[mostrarModalManualEletro.ambienteIndex].totalKwh = parseFloat(totalAmbiente.toFixed(2));

      setAmbientes(copia);
      setMostrarModalManualEletro({ aberto: false, ambienteIndex: null, comodoIndex: null, nomeEletro: '' });
      setNomeEletro('');
      setPotenciaEletro('');
      setTempoUsoEletro('');
      setResultadoBusca(null);
    } catch (error: any) {
      console.error('Detalhes do erro:', {
        message: error.message,
        response: error.response?.data,
        config: error.config,
      });
      alert(`Erro ao adicionar eletrodoméstico: ${error.response?.data?.error || error.message}`);
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
        `http://localhost:5000/api/usuario/ambientes/${ambienteId}/comodos/${comodoId}/eletrodomesticos/${eletroId}?userId=${userId}`,
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

  // Função para abrir modal de edição de ambiente
  const abrirModalEditarAmbiente = (ambienteIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setMostrarModalEditarAmbiente({
      aberto: true,
      ambienteIndex,
      novoNome: ambientes[ambienteIndex].nome
    });
  };

  // Função para renomear ambiente
  const renomearAmbiente = async () => {
    if (
      mostrarModalEditarAmbiente.ambienteIndex === null ||
      mostrarModalEditarAmbiente.novoNome.trim() === ''
    ) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      const ambienteId = ambientes[mostrarModalEditarAmbiente.ambienteIndex]._id;

      if (!token || !userId || !ambienteId) {
        alert('Dados inválidos para renomear ambiente');
        return;
      }

      const response = await axios.put(
        `http://localhost:5000/api/usuario/ambientes/${ambienteId}`,
        { userId, nome: mostrarModalEditarAmbiente.novoNome },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const copia = [...ambientes];
      copia[mostrarModalEditarAmbiente.ambienteIndex].nome = mostrarModalEditarAmbiente.novoNome;
      setAmbientes(copia);
      setMostrarModalEditarAmbiente({ aberto: false, ambienteIndex: null, novoNome: '' });
    } catch (error) {
      console.error('Erro ao renomear ambiente:', error);
      alert('Erro ao renomear ambiente. Tente novamente.');
    }
  };

  // Função para abrir modal de edição de cômodo
  const abrirModalEditarComodo = (ambienteIndex: number, comodoIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setMostrarModalEditarComodo({
      aberto: true,
      ambienteIndex,
      comodoIndex,
      novoNome: ambientes[ambienteIndex].comodos[comodoIndex].nome
    });
  };

  // Função para renomear cômodo
  const renomearComodo = async () => {
    if (
      mostrarModalEditarComodo.ambienteIndex === null ||
      mostrarModalEditarComodo.comodoIndex === null ||
      mostrarModalEditarComodo.novoNome.trim() === ''
    ) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      const ambienteId = ambientes[mostrarModalEditarComodo.ambienteIndex]._id;
      const comodoId = ambientes[mostrarModalEditarComodo.ambienteIndex].comodos[mostrarModalEditarComodo.comodoIndex]._id;

      if (!token || !userId || !ambienteId || !comodoId) {
        alert('Dados inválidos para renomear cômodo');
        return;
      }

      const response = await axios.put(
        `http://localhost:5000/api/usuario/ambientes/${ambienteId}/comodos/${comodoId}`,
        { userId, nome: mostrarModalEditarComodo.novoNome },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const copia = [...ambientes];
      copia[mostrarModalEditarComodo.ambienteIndex].comodos[mostrarModalEditarComodo.comodoIndex].nome = 
        mostrarModalEditarComodo.novoNome;
      setAmbientes(copia);
      setMostrarModalEditarComodo({ aberto: false, ambienteIndex: null, comodoIndex: null, novoNome: '' });
    } catch (error) {
      console.error('Erro ao renomear cômodo:', error);
      alert('Erro ao renomear cômodo. Tente novamente.');
    }
  };

  return (
    <div id="container-electrodomestic">
      <div id="modal">
        <h2>Lista de Eletrodomésticos por Ambiente e Cômodo</h2>
        <div id="scroll-ambientes">
          <div className="ambientes-wrapper">
            {ambientes.map((ambiente, ambIndex) => (
              <div className="ambiente" key={ambIndex}>
                <div className="ambiente-bar" onClick={() => alternarAmbiente(ambIndex)}>
                  <div className="ambiente-info">
                    <strong>{ambiente.nome}</strong>
                    <span>   </span>
                    <span>{ambiente.totalKwh.toFixed(2)} kWh</span>
                  </div>
                  <div className="ambiente-actions">
                    <img
                      src={editIcon}
                      alt="Editar"
                      className="editar-ambiente-img"
                      onClick={(e) => abrirModalEditarAmbiente(ambIndex, e)}
                    />
                    <img
                      src={deleteIcon}
                      alt="Remover"
                      className="remover-comodo-img"
                      onClick={(e) => {
                      e.stopPropagation();
                      removerAmbiente(ambIndex);
                      }}
                    />
                  </div>
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
                            <div className="comodo-info">
                              <strong>{comodo.nome}</strong>
                              <span>{comodo.totalKwh.toFixed(2)} kWh</span>
                            </div>
                            <div className="comodo-actions">
                              <img
                                src={editIcon}
                                alt="Editar"
                                className="editar-comodo-img"
                                onClick={(e) => abrirModalEditarComodo(ambIndex, comIndex, e)}
                              />
                              <img
                                src={deleteIcon}
                                alt="Remover"
                                className="remover-comodo-img"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removerComodo(ambIndex, comIndex);
                                }}
                              />
                            </div>
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

                              <button onClick={() => abrirModalBuscaEletro(ambIndex, comIndex)}>+ Adicionar Eletrodoméstico</button>
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

        {/* Modal buscar eletrodoméstico */}
        {mostrarModalBuscaEletro.aberto && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Buscar Eletrodoméstico</h3>
              <p>Digite o nome do eletrodoméstico para buscar o consumo estimado</p>
              <input
                type="text"
                placeholder="Ex: Geladeira, TV, Ar condicionado"
                value={buscaEletro}
                onChange={(e) => setBuscaEletro(e.target.value)}
              />
              
              {carregandoBusca && <p>Buscando consumo estimado...</p>}
              
              {resultadoBusca && (
                <div className="resultado-busca">
                  {resultadoBusca.encontrado ? (
                    <>
                      <p>Consumo estimado encontrado: {resultadoBusca.kwh?.toFixed(2)} kWh/mês</p>
                      <p>Potência estimada: {resultadoBusca.potenciaWatts?.toFixed(2)} Watts</p>
                      <div className="modal-buttons">
                        <button onClick={() => {
                          abrirModalManualEletro();
                          setTempoUsoEletro('');
                        }}>Usar valores estimados</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p>Não encontramos um consumo estimado para "{buscaEletro}"</p>
                      <div className="modal-buttons">
                        <button onClick={() => {
                          abrirModalManualEletro();
                          setPotenciaEletro('');
                          setTempoUsoEletro('');
                        }}>Inserir dados manualmente</button>
                      </div>
                    </>
                  )}
                  <button onClick={() => setMostrarModalBuscaEletro({ aberto: false, ambienteIndex: null, comodoIndex: null })}>
                    Cancelar
                  </button>
                </div>
              )}
              
              {!resultadoBusca && !carregandoBusca && (
                <div className="modal-buttons">
                  <button onClick={buscarConsumoEletro}>Buscar</button>
                  <button onClick={() => {
                    abrirModalManualEletro();
                    setPotenciaEletro('');
                    setTempoUsoEletro('');
                  }}>Inserir manualmente</button>
                  <button onClick={() => setMostrarModalBuscaEletro({ aberto: false, ambienteIndex: null, comodoIndex: null })}>
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal adicionar eletrodoméstico manualmente */}
        {mostrarModalManualEletro.aberto && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Adicionar Eletrodoméstico</h3>
              <input
                type="text"
                placeholder="Nome"
                value={nomeEletro}
                onChange={(e) => setNomeEletro(e.target.value)}
                disabled={resultadoBusca?.encontrado}
              />
              <input
                type="number"
                placeholder="Potência em Watts"
                value={potenciaEletro}
                onChange={(e) => setPotenciaEletro(e.target.value)}
                disabled={resultadoBusca?.encontrado}
              />
              <input
                type="number"
                placeholder="Tempo de uso diário (horas)"
                value={tempoUsoEletro}
                onChange={(e) => setTempoUsoEletro(e.target.value)}
              />
              <div className="modal-buttons">
                <button onClick={adicionarEletrodomestico}>Adicionar</button>
                <button onClick={() => {
                  setMostrarModalManualEletro({ aberto: false, ambienteIndex: null, comodoIndex: null, nomeEletro: '' });
                  setNomeEletro('');
                  setPotenciaEletro('');
                  setTempoUsoEletro('');
                  setResultadoBusca(null);
                }}>Cancelar</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal editar ambiente */}
        {mostrarModalEditarAmbiente.aberto && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Editar nome do ambiente</h3>
              <input
                type="text"
                placeholder="Novo nome"
                value={mostrarModalEditarAmbiente.novoNome}
                onChange={(e) => setMostrarModalEditarAmbiente({
                  ...mostrarModalEditarAmbiente,
                  novoNome: e.target.value
                })}
              />
              <div className="modal-buttons">
                <button onClick={renomearAmbiente}>Salvar</button>
                <button onClick={() => setMostrarModalEditarAmbiente({ 
                  aberto: false, 
                  ambienteIndex: null, 
                  novoNome: '' 
                })}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal editar cômodo */}
        {mostrarModalEditarComodo.aberto && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Editar nome do cômodo</h3>
              <input
                type="text"
                placeholder="Novo nome"
                value={mostrarModalEditarComodo.novoNome}
                onChange={(e) => setMostrarModalEditarComodo({
                  ...mostrarModalEditarComodo,
                  novoNome: e.target.value
                })}
              />
              <div className="modal-buttons">
                <button onClick={renomearComodo}>Salvar</button>
                <button onClick={() => setMostrarModalEditarComodo({ 
                  aberto: false, 
                  ambienteIndex: null, 
                  comodoIndex: null,
                  novoNome: '' 
                })}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="botao-centralizado">
        <button onClick={() => setMostrarModalAmbiente(true)}>Adicionar Ambiente</button>
      </div>
    </div>
  );
}