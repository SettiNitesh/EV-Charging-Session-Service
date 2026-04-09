import { DEFAULT_TARIFF } from '../constants/constants.js';

const TariffService = () => {
  const calculate = ({ energy, duration }) => {
    const tariff = { ...DEFAULT_TARIFF };

    const energyCost = energy * tariff.energyRate;
    const timeCost = duration * tariff.timeRate;

    const totalCost = energyCost + timeCost;

    return {
      energyCost: parseFloat(energyCost.toFixed(3)),
      timeCost: parseFloat(timeCost.toFixed(3)),
      totalCost: parseFloat(totalCost.toFixed(3)),
      tariff,
    };
  };

  return { calculate };
};

export default TariffService;
