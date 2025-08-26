export type ProductSim = {
  id: string;
  price: number;
  name: string;
  image?: string | null;
  description?: string | null;
  insertTime?: string | null;
  operator?: { id: number; name: string } | null;
  country?: { id: number; name: string; callingCode?: string } | null;
  internetPackage?: any | null;
};

export type GetProductSimsResp = {
  result: {
    paging: { totalRow: number; pageIndex: number; pagesize: number; filter?: any };
    products: ProductSim[];
  };
  success: boolean;
  message?: string;
  code?: number;
};

export type GetProductSimResp = {
  result: { product: ProductSim };
  success: boolean;
  message?: string;
  code?: number;
};
