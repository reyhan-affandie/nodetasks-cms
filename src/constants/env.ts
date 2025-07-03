export const NODE_ENV = process.env.NODE_ENV!.trim();
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME!.replaceAll("-"," ").trim();
export const APP_SLOGAN = process.env.NEXT_PUBLIC_APP_SLOGAN!.replaceAll("-"," ").trim();
export const API_URL = process.env.NEXT_PUBLIC_API_URL!.trim();
export const CMS_ORIGIN = process.env.NEXT_PUBLIC_CMS_ORIGIN!.trim();
export const PORT = process.env.PORT!;