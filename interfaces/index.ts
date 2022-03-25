


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
  name: string;
  ingredients: IngredientGroup[];
  instructions: InstructionGroup[];
  notes: string[];
}

