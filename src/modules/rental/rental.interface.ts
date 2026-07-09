export type IRentalItemInput = {
  gearItemId: string;
  quantity: number;
};

export type ICreateRentalInput = {
  startDate: string;
  endDate: string;
  items: IRentalItemInput[];
};
