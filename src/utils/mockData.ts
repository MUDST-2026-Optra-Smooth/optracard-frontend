// src/utils/mockData.ts
import { ProductCardProps } from '../components/ProductCard';

export const mockMarketplaceData: ProductCardProps[] = Array(6).fill({
  variant: 'marketplace',
  title: 'สมุดภาพสีน้ำ',
  subtitle: 'Battle of Yaoyorozu',
  itemsCount: 20,
  startingPrice: 200,
  imageUrl: 'https://via.placeholder.com/150x200?text=Card',
});

export const mockOfficialSingle: ProductCardProps[] = [
  { variant: 'official', title: 'อีเอ็ม คิริซากิ', price: 20000, subtitle: 'Battle of Yaoyorozu', imageUrl: 'https://via.placeholder.com/200x300' },
  { variant: 'official', title: 'Pikachu & Zekrom GX', price: 1200, subtitle: 'Pokemon', imageUrl: 'https://via.placeholder.com/200x300' },
  { variant: 'official', title: 'Monkey D. Luffy', price: 15000, subtitle: 'One Piece', imageUrl: 'https://via.placeholder.com/200x300' },
  { variant: 'official', title: 'มาสเตอร์พืช', price: 25000, subtitle: 'Battle of Yaoyorozu', imageUrl: 'https://via.placeholder.com/200x300' },
];

export const mockOfficialBooster: ProductCardProps[] = [
  { variant: 'official', title: 'One Piece OP-01 1 Pack', price: 150, subtitle: 'One Piece', imageUrl: 'https://via.placeholder.com/200' },
  { variant: 'official', title: 'Pokemon MEGA "Dream ex" 1 Pack', price: 120, subtitle: 'Pokemon', imageUrl: 'https://via.placeholder.com/200' },
  { variant: 'official', title: 'Bandai One Piece OP-04 1 Pack', price: 180, subtitle: 'One Piece', imageUrl: 'https://via.placeholder.com/200' },
  { variant: 'official', title: 'Battle of Yaoyorozu 1 Pack', price: 80, subtitle: 'Battle of Yaoyorozu', imageUrl: 'https://via.placeholder.com/200' },
];

// ใช้แพทเทิร์นนี้สำหรับ Booster Box และ Accessories ได้เลย
export const mockOfficialBox = mockOfficialBooster;
export const mockOfficialAccessories = mockOfficialBooster;