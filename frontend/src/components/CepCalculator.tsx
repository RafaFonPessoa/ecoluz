import axios from "axios"
import {useState}from 'react'
import './styles/cepcalculator.css'

export function CepCalculator() {
  const [cep, setCep] = useState('')


  const cepValidation = async() => {
    let formatedCep = cep.replace("-","")
    
    const onlyNumberValue = /^[0-9]+$/.test(formatedCep)
    
    if (!onlyNumberValue) {
      alert("CEP invalido!")
      return
    }

    if (cep.length !== 8) {
      alert("CEP invalido!")
      return
    }

    alert(formatedCep)
    
    try {
      const response = await axios.get(`https://viacep.com.br/ws/${formatedCep}/json/`)
      console.log(response.data)
    } catch (error) {
      console.log(error)
      alert("Erro ao Buscar CEP! Tente Novamente")
    }
  }

  return(
    <>
      <div id="container-cep-calculator">
        <h2>Calcular Consumo pelo Cep</h2>
        <input 
          type="text" 
          placeholder="Digite ceu CEP! 00000-000"
          value={cep}
          onChange={(e)=> setCep(e.target.value)}
        ></input>
        <button onClick={cepValidation}>Calcular</button>
      </div>
    </>
  )
}
