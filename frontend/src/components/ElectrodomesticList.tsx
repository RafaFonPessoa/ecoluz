import { useState } from 'react';
import './styles/electrodomesticliststyle.css';
import deleteIcon from './styles/delete.png';

type Ambiente = {
  nome: string;
  aberto: boolean;
  totalKwh: number;
  eletrodomesticos: string[];
};

export function ElectrodomesticList() {
  const [ambientes, setAmbientes] = useState<Ambiente[]>([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nomeAmbiente, setNomeAmbiente] = useState('');
  const [busca, setBusca] = useState('');
  const [ambienteSelecionado, setAmbienteSelecionado] = useState<number | null>(null);

  const adicionarAmbiente = () => {
    if (nomeAmbiente.trim() === '') return;

    const novo: Ambiente = {
      nome: nomeAmbiente,
      aberto: false,
      totalKwh: 0,
      eletrodomesticos: [],
    };

    setAmbientes([...ambientes, novo]);
    setNomeAmbiente('');
    setMostrarModal(false);
  };

  const alternarAmbiente = (index: number) => {
    const copia = [...ambientes];
    copia[index].aberto = !copia[index].aberto;
    setAmbientes(copia);
  };

  const adicionarEletrodomestico = () => {
    if (busca.trim() === '' || ambienteSelecionado === null) return;

    const copia = [...ambientes];
    copia[ambienteSelecionado].eletrodomesticos.push(busca);
    setAmbientes(copia);
    setBusca('');
  };

  const removerEletrodomestico = (ambienteIndex: number, itemIndex: number) => {
    const copia = [...ambientes];
    copia[ambienteIndex].eletrodomesticos.splice(itemIndex, 1);
    setAmbientes(copia);
  };

  return (
    <div id="container-electrodomestic">
      <h2>Lista de Eletrodomésticos por Ambiente</h2>

      <div id="scroll-ambientes">
        <div className="ambientes-wrapper">
          {ambientes.map((ambiente, index) => (
            <div className="ambiente" key={index}>
              <div className="ambiente-bar" onClick={() => alternarAmbiente(index)}>
                <strong>{ambiente.nome}</strong>
                <span>{ambiente.totalKwh} kWh</span>
                <span>{ambiente.aberto ? '▲' : '▼'}</span>
              </div>

              {ambiente.aberto && (
                <div className="ambiente-conteudo">
                  {ambiente.eletrodomesticos.length > 0 ? (
                    <ul>
                      {ambiente.eletrodomesticos.map((item, idx) => (
                        <li className="eletrodomestico-item" key={idx}>
                          {item}
                          <img
                            src={deleteIcon}
                            alt="Remover"
                            className="remover-eletrodomestico-img"
                            onClick={() => removerEletrodomestico(index, idx)}
                          />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Nenhum eletrodoméstico ainda.</p>
                  )}

                  <div className="adicionar-ambiente-container" style={{ marginTop: '15px' }}>
                    <input
                      type="text"
                      placeholder="Buscar eletrodoméstico"
                      value={ambienteSelecionado === index ? busca : ''}
                      onChange={(e) => {
                        setBusca(e.target.value);
                        setAmbienteSelecionado(index);
                      }}
                    />
                    <button onClick={adicionarEletrodomestico}>Adicionar</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="botao-centralizado">
        <button onClick={() => setMostrarModal(true)}>Adicionar Ambiente</button>
      </div>

      {mostrarModal && (
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
              <button onClick={() => setMostrarModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
