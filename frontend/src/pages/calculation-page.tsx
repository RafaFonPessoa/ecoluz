import { Navbar } from "../components/Navbar";

export function CalculationPage() {
  return (
    <>
      <Navbar />
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
        <button style={{ marginBottom: "20px", padding: "10px 15px" }}>
          <a href="/ecoluz">Voltar para o início</a>
        </button>

        <h2>Resultado da Simulação</h2>

        <div style={{
          border: "1px solid #ccc",
          borderRadius: "5px",
          padding: "15px",
          marginBottom: "20px",
          backgroundColor: "#f9f9f9"
        }}>
          <h3>Resumo por Eletrodoméstico</h3>
          <ul>
            <li>Geladeira: 120 kWh/mês - R$ 96,00</li>
            <li>Ar-condicionado: 200 kWh/mês - R$ 160,00</li>
            <li>TV: 50 kWh/mês - R$ 40,00</li>
            <li><i>(Esses dados são placeholders — serão substituídos pelo cálculo real)</i></li>
          </ul>
        </div>

        <div style={{
          border: "1px solid #ccc",
          borderRadius: "5px",
          padding: "15px",
          marginBottom: "20px",
          backgroundColor: "#f1f1f1"
        }}>
          <h3>Estimativa da Conta de Luz</h3>
          <p>Consumo total: <strong>370 kWh</strong></p>
          <p>Bandeira tarifária atual: <strong style={{color: "red"}}>Vermelha (2ª faixa)</strong></p>
          <p>Custo estimado: <strong style={{ color: "green" }}>R$ 296,00</strong></p>
        </div>

        <div style={{ textAlign: "right" }}>
          <button style={{
            padding: "10px 20px",
            backgroundColor: "#007BFF",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}>
            Refazer cálculo
          </button>
        </div>
      </div>
    </>
  );
}

