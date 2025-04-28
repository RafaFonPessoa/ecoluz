import { Navbar } from "../components/Navbar";
import { ElectrodomesticList } from "../components/ElectrodomesticList";
import {CepCalculator} from "../components/CepCalculator";
import {TariffFlagChecker} from "../components/TariffFlagChecker";

export function MainPage() {
  return (
    <div id="container-MainPage-form">
      <Navbar />

      {/* Conteúdo principal */}
      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '2rem' }}>
          <ElectrodomesticList />
          <CepCalculator/>
          <TariffFlagChecker/>
      </div>
    </div>
  );
}

