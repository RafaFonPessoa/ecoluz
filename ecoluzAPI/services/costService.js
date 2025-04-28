export function calcDeviceKWhPerMonth(powerW, hoursPerDay, days = 30) {
    return (powerW * hoursPerDay * days) / 1000; // kWh/mês
  }
  
  export async function calcEnvironmentCost(env, devices, uf) {
    const baseTariff = await getTariffByUF(uf);          // R$/kWh
    const { adicionalkWh } = await getCurrentFlag();     // R$/kWh
  
    const totalKWh = devices.reduce(
      (sum, d) => sum + calcDeviceKWhPerMonth(d.powerW, d.hoursPerDay),
      0
    );
  
    const price = totalKWh * (baseTariff + adicionalkWh);
    return { totalKWh, price };
  }
  