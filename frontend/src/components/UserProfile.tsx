import { useEffect, useState } from "react";
import './styles/user.css';
import axios from "axios";
import editIcon from './styles/edit.png';
import checkIcon from './styles/check.png';
import Toast from './Aviso';

interface Endereco {
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  complemento?: string;
}

interface Ambiente {
  endereco: Endereco;
}

interface UserData {
  name: string;
  email: string;
  ambientes: Ambiente[];
}

interface ViaCepResponse {
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  complemento?: string;
  erro?: boolean;
}

export function UserProfile() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cepAddress, setCepAddress] = useState<ViaCepResponse | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
        if (!token || !userId) {
          setError("Usuário não autenticado");
          setLoading(false);
          return;
        }

        const response = await axios.get('http://localhost:5000/api/userProfile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUserData(response.data);
        setNewName(response.data.name);

        const cep = response.data.cep;
        if (cep) fetchCepAddress(cep.replace(/\D/g, ''));
      } catch (err) {
        setError("Erro ao buscar dados do usuário");
      } finally {
        setLoading(false);
      }
    };

    const fetchCepAddress = async (cep: string) => {
      try {
        const response = await axios.get<ViaCepResponse>(`https://viacep.com.br/ws/${cep}/json/`);
        if (!response.data.erro) {
          setCepAddress(response.data);
        } else {
          setCepAddress(null);
          setError("CEP inválido ou não encontrado");
        }
      } catch {
        setCepAddress(null);
        setError("Erro ao buscar o endereço pelo CEP");
      }
    };

    fetchUserData();
  }, []);

  const handleNameUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      if (!token || !userId || !newName) return;

      await axios.put('http://localhost:5000/api/updateName', {
        userId,
        name: newName,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUserData(prev => prev ? { ...prev, name: newName } : prev);
      setEditingName(false);
      setToast({ message: "Nome atualizado com sucesso!", type: "success" });
    } catch (error) {
      console.error("Erro ao atualizar nome:", error);
      setToast({ message: "Erro ao atualizar nome.", type: "error" });
    }
  };

  const handlePasswordChange = async () => {
    try {
        const token = localStorage.getItem("token");
        if (!token || !currentPassword || !newPassword) {
        setToast({ message: "Preencha todos os campos.", type: "error" });
        return;
        }
        console.log("tentando atualizar senha", currentPassword, newPassword);

        const response = await axios.put('http://localhost:5000/api/updatePassword', {
        senhaAtual: currentPassword,   
        novaSenha: newPassword        
        }, {
        headers: { Authorization: `Bearer ${token}` }
        });

        if (response.status === 200) {
        setToast({ message: "Senha atualizada com sucesso!", type: "success" });
        setShowPasswordModal(false);
        setCurrentPassword('');
        setNewPassword('');
        } else {
        setToast({ message: "Erro ao atualizar senha.", type: "error" });
        }
    } catch (error: any) {
        const errorMsg = error.response?.data?.error || "Erro ao atualizar senha.";
        console.error("Erro ao atualizar senha:", error);
        setToast({ message: errorMsg, type: "error" });
    }
    };


  if (loading) return <p>Carregando dados do usuário...</p>;
  if (error) return <p>{error}</p>;
  if (!userData) return <p>Dados do usuário não disponíveis.</p>;

  return (
    <div className="user-profile">
      <h2>Perfil do Usuário</h2>

      <div className="user-info">
        <div className="editable-line">
          <strong>Nome:</strong>
          {editingName ? (
            <>
              <input value={newName} onChange={(e) => setNewName(e.target.value)} />
              <img src={checkIcon} alt="Confirmar" onClick={handleNameUpdate} style={{ cursor: 'pointer', marginLeft: '10px' }} />
            </>
          ) : (
            <>
              <span>{userData.name}</span>
              <img src={editIcon} alt="Editar" onClick={() => setEditingName(true)} style={{ cursor: 'pointer', marginLeft: '10px' }} />
            </>
          )}
        </div>
        <p><strong>Email:</strong> {userData.email}</p>
      </div>

      <div className="user-adress-info">
        <h3>Endereço detalhado via CEP:</h3>
      </div>
      {cepAddress && (
          <div className="user-adress">
            <p><strong>Rua:</strong> {cepAddress.logradouro}</p>
            <p><strong>Bairro:</strong> {cepAddress.bairro}</p>
            <p><strong>Cidade:</strong> {cepAddress.localidade}</p>
            <p><strong>Estado:</strong> {cepAddress.uf}</p>
          </div>
        )}

      <button onClick={() => setShowPasswordModal(true)}>Alterar senha</button>

      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Alterar Senha</h3>
            <label>Senha Atual:</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            <label>Nova Senha:</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <div className="modal-buttons">
              <button onClick={handlePasswordChange}>Confirmar</button>
              <button onClick={() => setShowPasswordModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
