// Exemplo de como usar o MondrianLayout para gerar dados de bitmap
import MondrianLayout from "./utils/MondrianLayout.js";

// Função para demonstrar o uso do MondrianLayout
function demonstrateMondrianLayout() {
  // Exemplo 1: Array simples
  console.log("Exemplo 1: Array simples [5, 5, 4, 1]");
  const txList1 = [5, 5, 4, 1];
  const mondrian1 = new MondrianLayout(txList1);
  
  console.log("Tamanho do layout:", mondrian1.getSize());
  console.log("Slots gerados:", mondrian1.slots);
  console.log("\n");
  
  // Exemplo 2: Array maior
  console.log("Exemplo 2: Array maior [5, 5, 4, 3, 2, 1, 1, 1]");
  const txList2 = [5, 5, 4, 3, 2, 1, 1, 1];
  const mondrian2 = new MondrianLayout(txList2);
  
  console.log("Tamanho do layout:", mondrian2.getSize());
  console.log("Slots gerados:", mondrian2.slots);
  console.log("\n");
  
  // Exemplo 3: Preenchendo espaços vazios
  console.log("Exemplo 3: Preenchendo espaços vazios");
  const txList3 = [5, 3, 2];
  const mondrian3 = new MondrianLayout(txList3);
  
  console.log("Antes de preencher espaços vazios:");
  console.log("Tamanho do layout:", mondrian3.getSize());
  console.log("Slots originais:", mondrian3.slots);
  
  // Preencher espaços vazios e obter os slots preenchidos
  const filledSlots = mondrian3.fillEmptySpaces(true);
  
  console.log("Depois de preencher espaços vazios:");
  console.log("Slots adicionais para preencher espaços vazios:", filledSlots.filter(slot => 
    !mondrian3.slots.some(original => 
      original.position.x === slot.position.x && 
      original.position.y === slot.position.y && 
      original.size === slot.size
    )
  ));
  console.log("Total de slots após preenchimento:", filledSlots.length);
}

// Executar a demonstração
demonstrateMondrianLayout(); 