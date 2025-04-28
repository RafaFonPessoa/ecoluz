import './styles/electrodomesticliststyle.css';

export function ElectrodomesticList() {
  return (
    <div id="container-electrodomestic">
      <h2>Lista de Eletrodomésticos</h2>
      <div id="div-electrodomestic-list">
        {/* Aqui você pode depois mapear seus eletrodomésticos */}
        {/* Exemplo: {electrodomesticos.map((item) => <ElectrodomesticCard key={item.id} data={item} />)} */}
      </div>
    </div>
  );
}

