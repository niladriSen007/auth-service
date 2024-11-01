export const calculateDiscount = (price: number, discount: number): number => {
    return price - price * discount;
};
