import './styles/cepcalculator.css'

export function CepCalculator() {
  return(
    <>
      <div id="container-cep-calculator">
        <h2>Calcular Consumo pelo Cep</h2>
        <input type="text" placeholder="Digite ceu CEP! 00000-000"></input>
        <button>Calcular</button>
      </div>
    </>
  )
}
