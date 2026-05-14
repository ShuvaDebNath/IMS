export interface SearchField {
  type: 'text' | 'dropdown' | 'date';
  label: string;
  controlName: string;

  placeholder?: string;

  options?: any[];

  optionLabel?: string;
  optionValue?: string;

  disabled?: boolean;

  showClear?: boolean;

  filter?: boolean;

  message?: string;

  visible?: boolean;
}