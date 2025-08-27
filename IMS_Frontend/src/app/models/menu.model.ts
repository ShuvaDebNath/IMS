export interface Menu {
  MenuId: number;
  MenuName: string;
  SubMenuName: string;
  UiLink?: string;
  isActive: boolean;
  ysnParent: boolean;
  OrderBy: number;
  MenuLogo?: string;
  Children?: Menu[];
}