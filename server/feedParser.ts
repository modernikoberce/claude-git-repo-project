import axios from "axios";
import xml2js from "xml2js";

export interface ParsedProduct {
  externalId: string;
  name: string;
  description: string | null;
  price: string | null;
  imgUrl: string | null;
  productUrl: string | null;
  brand: string | null;
  category: string | null;
  params: Record<string, string>;
  shopName: string;
  shopUrl: string;
}

export async function parseFeed(feedUrl: string, shopName: string, shopUrl: string): Promise<ParsedProduct[]> {
  console.log(`[Feed] Načítám feed: ${feedUrl}`);
  
  const response = await axios.get(feedUrl, { timeout: 30000 });
  const xml = response.data;
  
  const parser = new xml2js.Parser({ explicitArray: false });
  const result = await parser.parseStringPromise(xml);
  
  const items = result?.SHOP?.SHOPITEM;
  if (!items) {
    console.log("[Feed] Žádné produkty nenalezeny");
    return [];
  }
  
  const itemArray = Array.isArray(items) ? items : [items];
  
  return itemArray.map((item: any) => {
    const params: Record<string, string> = {};
    
    // Zpracování PARAM elementů
    if (item.PARAMS?.PARAM) {
      const paramList = Array.isArray(item.PARAMS.PARAM) 
        ? item.PARAMS.PARAM 
        : [item.PARAMS.PARAM];
      
      paramList.forEach((param: any) => {
        if (param.PARAM_NAME && param.VAL) {
          params[param.PARAM_NAME] = param.VAL;
        }
      });
    }
    
    return {
      externalId: String(item.ITEM_ID || item.ID || ""),
      name: String(item.PRODUCTNAME || item.NAME || ""),
      description: item.DESCRIPTION ? String(item.DESCRIPTION) : null,
      price: item.PRICE_VAT ? String(item.PRICE_VAT) : null,
      imgUrl: item.IMGURL ? String(item.IMGURL) : null,
      productUrl: item.URL ? String(item.URL) : null,
      brand: item.MANUFACTURER ? String(item.MANUFACTURER) : null,
      category: item.CATEGORYTEXT ? String(item.CATEGORYTEXT) : null,
      params,
      shopName,
      shopUrl,
    };
  });
}