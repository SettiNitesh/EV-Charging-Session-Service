const TraiffService = () => {
  const calculate = ({ energy, duration }) => {
    const tariff = { energyRate: 10, timeRate: 2 };

    const energyCost = energy * tariff.energyRate;
    const timeCost = duration * tariff.timeRate;

    const totalCost = energyCost + timeCost;

    return { energyCost, timeCost, totalCost, tariff };
  };

  return { calculate };
};

export default TraiffService;
