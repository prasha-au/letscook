
export enum TableName {
  RECIPE = 'recipe',
  PARSE_REQUEST = 'parse_request',
  RECIPE_METADATA = 'recipe_metadata'
}


export interface IngredientGroup {
  name?: string;
  ingredients: {
    name: string;
    amount: string;
    unit: string;
    notes?: string;
  }[];
}

export interface InstructionGroup {
  name?: string;
  steps: string[];
}


export interface Recipe {
  url: string;
  name: string;
  image?: string;
  ingredients: IngredientGroup[];
  instructions: InstructionGroup[];
  notes: string[];
}


export type ParseRequest = {
  url: string;
} & (
  { status: 'pending' | 'active' } |
  { status: 'done'; success: false, error: string } |
  { status: 'done'; success: true }
);

export interface ResolvedUrl {
  id: string;
  url: string;
}

export interface ReciepeMetadata {
  url: string;
  site: string;
  name: string;
  image?: string;
  timestamp: number;
}
