// status: 'agendado' | 'realizado' | 'cancelado'
// Cada agendamento pode ser dividido em até 2 dias (regra: 8-10h totais, máx. 2 restaurantes/chef/dia)
export const AGENDAMENTOS_SEED = [
  {
    id: 'a1',
    restauranteId: 'r1',
    chefId: 'c3',
    status: 'realizado',
    diasPlanejados: [
      { data: '2026-05-12', periodo: 'manhã', horas: 5 },
      { data: '2026-05-13', periodo: 'manhã', horas: 5 },
    ],
    dataProximoSugerida: '2026-07-14',
  },
  {
    id: 'a2',
    restauranteId: 'r1',
    chefId: 'c3',
    status: 'agendado',
    diasPlanejados: [
      { data: '2026-07-14', periodo: 'manhã', horas: 5 },
      { data: '2026-07-15', periodo: 'manhã', horas: 5 },
    ],
    dataProximoSugerida: null,
  },
  {
    id: 'a3',
    restauranteId: 'r2',
    chefId: 'c2',
    status: 'realizado',
    diasPlanejados: [
      { data: '2026-04-20', periodo: 'tarde', horas: 4 },
      { data: '2026-04-21', periodo: 'tarde', horas: 4 },
    ],
    dataProximoSugerida: '2026-06-22',
  },
  {
    id: 'a4',
    restauranteId: 'r2',
    chefId: 'c12',
    status: 'cancelado',
    diasPlanejados: [
      { data: '2026-06-25', periodo: 'tarde', horas: 3 },
    ],
    dataProximoSugerida: null,
  },
  {
    id: 'a5',
    restauranteId: 'r5',
    chefId: 'c5',
    status: 'realizado',
    diasPlanejados: [
      { data: '2026-05-05', periodo: 'tarde', horas: 5 },
      { data: '2026-05-06', periodo: 'tarde', horas: 5 },
    ],
    dataProximoSugerida: '2026-07-05',
  },
  {
    id: 'a6',
    restauranteId: 'r5',
    chefId: 'c5',
    status: 'agendado',
    diasPlanejados: [
      { data: '2026-07-05', periodo: 'tarde', horas: 5 },
      { data: '2026-07-06', periodo: 'tarde', horas: 5 },
    ],
    dataProximoSugerida: null,
  },
]

// Fotos/vídeos da visita. tipo: 'interna' (chef + Luciano) | 'compartilhada' (cliente também vê)
export const FOTOS_SEED = [
  { id: 'f1', agendamentoId: 'a1', tipo: 'interna', label: 'Organização da cozinha antes da consultoria', criadaEm: '2026-05-12' },
  { id: 'f2', agendamentoId: 'a1', tipo: 'interna', label: 'Processo de mise en place observado', criadaEm: '2026-05-12' },
  { id: 'f3', agendamentoId: 'a1', tipo: 'compartilhada', label: 'Novo layout de estação de montagem', criadaEm: '2026-05-13' },
  { id: 'f4', agendamentoId: 'a1', tipo: 'compartilhada', label: 'Prato finalizado com nova apresentação', criadaEm: '2026-05-13' },
  { id: 'f5', agendamentoId: 'a3', tipo: 'interna', label: 'Controle de estoque de bebidas (antes)', criadaEm: '2026-04-20' },
  { id: 'f6', agendamentoId: 'a3', tipo: 'compartilhada', label: 'Novo cardápio de drinks sugerido', criadaEm: '2026-04-21' },
  { id: 'f7', agendamentoId: 'a5', tipo: 'interna', label: 'Anotações de fluxo de cozinha', criadaEm: '2026-05-05' },
  { id: 'f8', agendamentoId: 'a5', tipo: 'compartilhada', label: 'Prato sinal revisado', criadaEm: '2026-05-06' },
  { id: 'f9', agendamentoId: 'a5', tipo: 'compartilhada', label: 'Equipe durante treinamento de montagem', criadaEm: '2026-05-06' },
]

// Anotações privadas — visíveis só para o chef responsável + Luciano
export const NOTAS_PRIVADAS_SEED = [
  { agendamentoId: 'a1', texto: 'Equipe de cozinha resistente a mudanças no início. Ficha técnica de massas precisa de revisão urgente — perda alta de insumo. Sugiro acompanhamento mais próximo nos próximos 60 dias.' },
  { agendamentoId: 'a3', texto: 'Bom potencial de melhoria na precificação de drinks (margem atual muito baixa). Dono receptivo, mas precisa de planilha simples — evitar termos técnicos.' },
  { agendamentoId: 'a5', texto: 'Cozinha pequena, gargalo de espaço no horário de pico. Treinamento de montagem rendeu bem. Acompanhar adoção do novo prato sinal no próximo retorno.' },
]

// Relatório resumido que o cliente recebe — sem detalhes técnicos
export const RELATORIOS_SEED = [
  { agendamentoId: 'a1', texto: 'Visita realizada com foco em organização de cozinha e padronização de pratos. Ajustamos o layout da estação de montagem e revisamos a apresentação de dois pratos principais. Próximo acompanhamento sugerido para reforçar os ajustes.' },
  { agendamentoId: 'a3', texto: 'Consultoria focada em controle de estoque de bebidas e revisão do cardápio de drinks. Apresentamos uma nova proposta de cardápio com foco em valorizar os itens de maior margem.' },
  { agendamentoId: 'a5', texto: 'Trabalhamos a organização do fluxo de cozinha em horário de pico e revisamos a apresentação do prato sinal da casa, com treinamento prático para a equipe de montagem.' },
]
